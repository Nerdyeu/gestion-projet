import { PublicClientApplication } from '@azure/msal-browser'
import { Client } from '@microsoft/microsoft-graph-client'

// Configuration MSAL - Utilise le client ID public de Microsoft Graph Explorer
const msalConfig = {
  auth: {
    clientId: 'de8bc8b5-d9f9-48b1-a8ad-b748da725064', // Microsoft Graph Explorer Client ID (public)
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://developer.microsoft.com/en-us/graph/graph-explorer',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
}

// Permissions demandées
const loginRequest = {
  scopes: ['User.Read', 'Calendars.Read', 'Calendars.ReadWrite'],
}

// Instance MSAL
let msalInstance = null

// Initialiser MSAL
export const initializeMsal = async () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
    await msalInstance.initialize()
  }
  return msalInstance
}

// Se connecter à Microsoft
export const loginToMicrosoft = async () => {
  try {
    const msal = await initializeMsal()
    const response = await msal.loginPopup(loginRequest)
    return response.account
  } catch (error) {
    console.error('Erreur lors de la connexion Microsoft:', error)
    throw error
  }
}

// Se déconnecter
export const logoutFromMicrosoft = async () => {
  try {
    const msal = await initializeMsal()
    const currentAccount = msal.getAllAccounts()[0]
    if (currentAccount) {
      await msal.logoutPopup({ account: currentAccount })
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    throw error
  }
}

// Obtenir le token d'accès
const getAccessToken = async () => {
  try {
    const msal = await initializeMsal()
    const accounts = msal.getAllAccounts()

    if (accounts.length === 0) {
      throw new Error('Aucun compte connecté')
    }

    const request = {
      ...loginRequest,
      account: accounts[0],
    }

    try {
      const response = await msal.acquireTokenSilent(request)
      return response.accessToken
    } catch (error) {
      // Si le token silencieux échoue, utiliser popup
      const response = await msal.acquireTokenPopup(request)
      return response.accessToken
    }
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token:', error)
    throw error
  }
}

// Créer le client Graph
const getGraphClient = async () => {
  const accessToken = await getAccessToken()

  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}

// Récupérer les événements du calendrier
export const getCalendarEvents = async (startDate, endDate) => {
  try {
    const client = await getGraphClient()

    // Formater les dates pour l'API Graph
    const start = startDate.toISOString()
    const end = endDate.toISOString()

    const events = await client
      .api('/me/calendarView')
      .query({
        startDateTime: start,
        endDateTime: end,
      })
      .select('subject,start,end,location,bodyPreview,isAllDay')
      .orderby('start/dateTime')
      .get()

    return events.value || []
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
    throw error
  }
}

// Créer un événement dans Outlook
export const createCalendarEvent = async (eventData) => {
  try {
    const client = await getGraphClient()

    const event = {
      subject: eventData.title,
      body: {
        contentType: 'HTML',
        content: eventData.description || '',
      },
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Europe/Paris',
      },
    }

    const createdEvent = await client.api('/me/events').post(event)
    return createdEvent
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
    throw error
  }
}

// Vérifier si l'utilisateur est connecté
export const isUserLoggedIn = async () => {
  try {
    const msal = await initializeMsal()
    const accounts = msal.getAllAccounts()
    return accounts.length > 0
  } catch (error) {
    return false
  }
}

// Obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const msal = await initializeMsal()
    const accounts = msal.getAllAccounts()
    return accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    return null
  }
}
