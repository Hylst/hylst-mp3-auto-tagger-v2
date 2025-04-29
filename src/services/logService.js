// Service pour gérer les logs de l'application

class LogService {
  constructor() {
    this.logs = [];
    this.listeners = [];
  }

  // Ajouter un nouveau log
  addLog(log) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      ...log
    };
    
    this.logs.push(logEntry);
    
    // Limiter le nombre de logs stockés (garder les 100 derniers)
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
    
    // Notifier tous les listeners
    this.notifyListeners(logEntry);
    
    return logEntry;
  }

  // Ajouter un log d'information
  info(message, details = null) {
    return this.addLog({
      severity: 'info',
      message: typeof message === 'string' ? message : { title: 'Information', details: message },
      details
    });
  }

  // Ajouter un log de succès
  success(message, details = null) {
    return this.addLog({
      severity: 'success',
      message: typeof message === 'string' ? message : { title: 'Succès', details: message },
      details
    });
  }

  // Ajouter un log d'avertissement
  warning(message, details = null) {
    return this.addLog({
      severity: 'warning',
      message: typeof message === 'string' ? message : { title: 'Avertissement', details: message },
      details
    });
  }

  // Ajouter un log d'erreur
  error(message, details = null) {
    return this.addLog({
      severity: 'error',
      message: typeof message === 'string' ? message : { title: 'Erreur', details: message },
      details
    });
  }

  // S'abonner aux nouveaux logs
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notifier tous les listeners d'un nouveau log
  notifyListeners(log) {
    this.listeners.forEach(listener => {
      try {
        listener(log);
      } catch (error) {
        console.error('Erreur dans un listener de logs:', error);
      }
    });
  }

  // Récupérer tous les logs
  getLogs() {
    return [...this.logs];
  }

  // Effacer tous les logs
  clearLogs() {
    this.logs = [];
    this.notifyListeners({ type: 'clear' });
  }
}

// Exporter une instance unique du service
const logService = new LogService();
export default logService;