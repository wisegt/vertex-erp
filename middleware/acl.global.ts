import { canNavigate } from '@layouts/plugins/casl'

export default defineNuxtRouteMiddleware(to => {
  /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
  if (to.meta.public)
    return

  const { status } = useAuth()
  const isLoggedIn = status.value === 'authenticated'

  /*
      If user is logged in and is trying to access login like page, redirect to home
      else allow visiting the page
      (WARN: Don't allow executing further by return statement because next code will check for permissions)
     */
  if (to.meta.unauthenticatedOnly) {
    if (isLoggedIn)
      return navigateTo('/')
    else
      return undefined
  }

  // Rutas que solo requieren estar autenticado (sin verificación de permisos CASL específicos)
  const authOnlyRoutes = ['/pages/account-settings', '/dashboards', '/apps']
  const isAuthOnlyRoute = authOnlyRoutes.some(route => to.path.startsWith(route))

  // Si es una ruta que solo requiere autenticación y el usuario está logueado, permitir acceso
  if (isAuthOnlyRoute && isLoggedIn) {
    return
  }

  if (!canNavigate(to) && to.matched.length) {
    /* eslint-disable indent */
    return navigateTo(isLoggedIn
      ? { name: 'not-authorized' }
      : {
          name: 'login',
          query: {
            ...to.query,
            to: to.fullPath !== '/' ? to.path : undefined,
          },
        })
    /* eslint-enable indent */
  }
})
