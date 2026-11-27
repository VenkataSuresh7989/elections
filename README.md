# polling

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Firestore search history

The app stores search history in the `elections-user-search-history` Firestore collection. Firebase web-app settings are read from the `VUE_APP_FIREBASE_*` variables in `.env.local`.

To enable access, copy `firestore.rules` into the Firestore Rules tab in the Firebase console and publish them. This shared-history setup makes saved mobile numbers and officer names publicly readable; rules allow new valid records, but not updates or deletes.
