let app;
try {
  // on essaie de charger l'application
  app = require('../backend/src/server').default;
} catch (error: any) {
  // en cas de crash, on crée un faux serveur qui renvoie l'erreur en clair !
  console.error("Crash au démarrage de Vercel :", error);
  app = require('express')();
  app.use((req: any, res: any) => {
    res.status(500).json({
      titre: 'CRASH VERCEL (FUNCTION_INVOCATION_FAILED)',
      message: error.message,
      stack: error.stack,
    });
  });
}

export default app;
