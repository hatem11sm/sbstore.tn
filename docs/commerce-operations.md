# Commerce Operations

Cette note résume les briques commerce ajoutées au projet et ce qu'il faut
configurer pour les rendre pleinement opérationnelles.

## Déjà en place

- Checkout avec :
  - paiement à la livraison
  - paiement en ligne (mode structure prête)
  - code promo
- Numéro de commande lisible (`SB-YYYY-...`)
- Répartition boutique par commande
- Statut de paiement
- Dashboard admin pour gérer les codes promo
- Emails prêts pour :
  - client
  - admin
  - vendeur concerné

## Variables d'environnement email

Ajouter dans `.env` :

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=orders@your-domain.com
ORDER_NOTIFICATION_EMAIL=admin@your-domain.com
```

## Codes promo par défaut

Le système garantit l'existence de :

- `BIENVENUE10`
- `SB5`

Ils deviennent visibles dans `/dashboard/promos`.

## Pour un vrai paiement en ligne

La structure est prête, mais l'encaissement réel demande une passerelle.

Options possibles :

- Stripe
- Konnect
- Flouci

Étapes recommandées :

1. créer une route API pour générer une session de paiement
2. rediriger le client vers la passerelle
3. confirmer le paiement via webhook
4. mettre `paymentStatus` à `paid`

## Parcours admin conseillé

1. créer les promos depuis `/dashboard/promos`
2. suivre les commandes dans `/dashboard/orders`
3. vérifier :
   - mode de paiement
   - statut paiement
   - promo utilisée
   - répartition par boutique
