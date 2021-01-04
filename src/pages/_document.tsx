import React from 'react'
import Document, {
  Html, Head, Main, NextScript, DocumentContext,
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link
            // eslint-disable-next-line max-len
            href="https://fonts.googleapis.com/css?family=Dancing+Script:400,700|M+PLUS+1p:400,700&display=swap"
            rel="stylesheet"
          />
          <meta property="fb:app_id" content="1398695963738160" />
          <meta property="og:url" content="https://web.com/" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="WEB" />
          <meta property="og:image" content="https://web.com/images/cover.png" />
          <meta property="og:description" content="This is web template" />
          <meta property="og:site_name" content="WEB templste" />
          <meta property="og:locale" content="ja_JP" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
