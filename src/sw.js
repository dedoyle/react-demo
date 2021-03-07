if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 每次都卸载之前的 serviceWorker
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister()
      }
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  })
}
