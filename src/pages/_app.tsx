import type { AppProps } from 'next/app'
import '../styles/tailwind.scss'
import '../styles/app.scss'

const BackyardApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
)

export default BackyardApp
