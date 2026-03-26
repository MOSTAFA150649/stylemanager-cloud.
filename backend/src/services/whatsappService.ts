/**
 * Service pour envoyer des notifications WhatsApp
 */
import axios from 'axios';

// Note: Ces valeurs devront être configurées dans le .env
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const RECIPIENT_PHONE_NUMBER = process.env.RECIPIENT_PHONE_NUMBER;

export const sendWhatsAppNotification = async (message: string) => {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !RECIPIENT_PHONE_NUMBER) {
    console.log('WhatsApp Service: Configuration manquante. Message non envoyé:', message);
    return;
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    // Exemple pour l'API WhatsApp Cloud (Meta)
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: RECIPIENT_PHONE_NUMBER,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('WhatsApp Notification envoyée avec succès');
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi WhatsApp:', error.response?.data || error.message);
  }
};
