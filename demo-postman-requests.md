# Requêtes Postman pour Démonstration API - Exposé 5 minutes

## Configuration de base Postman
- **Base URL**: `http://localhost:3000` (ou votre URL de déploiement)
- **Headers communs**: 
  - `Content-Type: application/json`
  - `Accept: application/json`

---

## 🎯 **1. Matchs en Direct avec Cotes Statistiques** ⭐ 
**LA REQUÊTE STAR POUR VOTRE DEMO !**

```
GET /api/fixtures/live-now
```

**Pourquoi cette requête ?**
- Montre des matchs en temps réel
- Affiche les cotes calculées automatiquement
- Données groupées par compétition avec priorités
- Parfait pour impressionner l'audience !

**Réponse attendue :**
```json
{
  "success": true,
  "count": 4,
  "fixtures": [
    {
      "fixture": {
        "id": 9001,
        "status": { "long": "Second Half", "short": "2H", "elapsed": 72 },
        "venue": { "name": "Emirates Stadium", "city": "London" }
      },
      "teams": {
        "home": { "name": "Arsenal", "winner": true },
        "away": { "name": "Tottenham", "winner": false }
      },
      "goals": { "home": 3, "away": 1 },
      "calculatedOdds": {
        "homeWin": 1.85,
        "draw": 3.20,
        "awayWin": 4.50,
        "confidence": "high"
      }
    }
  ],
  "groupedByCompetition": { ... },
  "oddsCalculation": "statistical"
}
```

---

## 🗓️ **2. Matchs du Jour avec Analyse Statistique**

```
GET /api/fixtures/today
```

**Points forts :**
- Affiche tous les matchs d'aujourd'hui
- Cotes pré-calculées pour les paris
- Système de priorité des compétitions
- Statistiques détaillées des équipes

---

## 🔍 **3. Détails d'un Match Spécifique**

```
GET /api/fixtures/9001
```

**Avantages :**
- Informations complètes sur un match
- Événements en temps réel (buts, cartons)
- Cotes mises à jour
- Statistiques avancées

---

## 🏆 **4. Recherche de Matchs avec Filtres**

```
GET /api/fixtures?league=39&season=2024&limit=10
```

**Paramètres utiles :**
- `league=39` (Premier League)
- `team=33` (Manchester United)
- `status=LIVE` (matchs en cours)
- `limit=10` (nombre de résultats)

---

## 🏁 **5. Matchs Terminés (pour les Résultats)**

```
GET /api/fixtures/finished
```

**Utilité :**
- Récupère les matchs terminés récemment
- Essentiel pour calculer les gains des paris
- Données fraîches (dernières 2 heures)

---

## 🔎 **6. Recherche d'Équipes**

```
GET /api/fixtures/teams/search?name=Arsenal
```

**Fonctionnalités :**
- Recherche par nom d'équipe
- Filtrage par ligue ou pays
- Informations complètes sur les équipes

---

## 🎤 **Script de Présentation (5 minutes)**

### **Introduction (30 sec)**
*"Aujourd'hui je vais vous présenter notre API de paris sportifs qui combine données en temps réel et intelligence statistique."*

### **Demo 1 - Matchs Live (1.5 min)**
1. Montrer `/live-now`
2. Expliquer les cotes calculées automatiquement
3. Souligner le groupement par compétition

### **Demo 2 - Intelligence API (1.5 min)**
1. Montrer `/today` avec les prédictions
2. Expliquer l'algorithme de calcul des cotes
3. Montrer les statistiques détaillées

### **Demo 3 - Recherche Avancée (1 min)**
1. Utiliser les filtres sur `/fixtures`
2. Montrer la recherche d'équipes
3. Expliquer la gestion du cache

### **Demo 4 - Gestion des Erreurs (30 sec)**
1. Montrer la robustesse avec données placeholder
2. Expliquer la gestion des limites d'API

### **Conclusion (30 sec)**
*"Cette API démontre une architecture robuste avec intelligence métier, cache intelligent, et gestion d'erreurs professionnelle."*

---

## 🚀 **Points Forts à Mentionner**

1. **🧠 Intelligence Artificielle** - Calcul automatique des cotes basé sur les statistiques
2. **⚡ Performance** - Système de cache intelligent (5min live, 30min statique)
3. **🛡️ Robustesse** - Données placeholder quand l'API externe est indisponible
4. **📊 Organisation** - Tri automatique par importance des compétitions
5. **🎯 Temps Réel** - Mise à jour des scores et événements en direct
6. **🔧 Flexibilité** - Multiples endpoints avec filtres avancés

---

## 💡 **Conseils pour la Présentation**

1. **Commencez par `/live-now`** - L'effet "WOW" garanti !
2. **Montrez les données en temps réel** - Scores qui changent
3. **Expliquez l'intelligence métier** - Comment les cotes sont calculées
4. **Démontrez la robustesse** - Que faire quand l'API externe tombe
5. **Terminez par la recherche** - Montrer la flexibilité

**Astuce Pro :** Préparez des matchs avec des noms d'équipes connues (Arsenal, Real Madrid, PSG) pour captiver votre audience !
