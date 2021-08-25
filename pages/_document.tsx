import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { URL_API, ZENDESK_CHAT_ACCOUNT_KEY } from 'lib/consts';

class MyDocument extends Document {
  public renderZendeskSnippet(): string {
    return `
      window.zESettings = {
        webWidget: {
          authenticate: {
            chat: {
              jwtFn: function (callback) {
                fetch("${URL_API}/api/v2/public/zendesk-token", {
                  credentials: 'include',
                }).then(function (res) {
                  res.json().then(function (jwt) {
                    console.log("jwt", jwt);
                    jwt.token && callback(jwt.token);
                    ;
                  });
                });
              }
            }
          }
        }
      };
    `;
  }

  public renderSnippetsForSignedInUsers(): JSX.Element {
    return (
      <>
        <script
          id="ze-snippet"
          src={`https://static.zdassets.com/ekr/snippet.js?key=${ZENDESK_CHAT_ACCOUNT_KEY}`}
        />
        <script dangerouslySetInnerHTML={{ __html: this.renderZendeskSnippet() }} />
      </>
    );
  }

  public render(): JSX.Element {
    const { pageProps } = this.props.__NEXT_DATA__.props;
    const user = pageProps.initialState && pageProps.initialState.user;
    const isThemeDark = user && user.darkTheme;

    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="google" content="notranslate" />
          <meta name="theme-color" content="#303030" />

          <link rel="shortcut icon" href="https://cdn.landen.co/461fxwsy03g8/assets/d88voyx0.png" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;500;700;900&display=swap"
            rel="stylesheet"
          />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <link
            rel="stylesheet"
            href={
              isThemeDark
                ? 'https://storage.googleapis.com/async-await/nprogress-light.min.css?v=1'
                : 'https://storage.googleapis.com/async-await/nprogress-dark.min.css?v=1'
            }
          />
          <link rel="stylesheet" href="https://storage.googleapis.com/async-await/vs2015.min.css" />

          <style>
            {`
              a,
              a:focus {
                font-weight: 400;
                color: ${isThemeDark ? '#fff' : '#000'};
                text-decoration: none;
                outline: none;
              }
              a:hover,
              button:hover {
                opacity: 0.75;
                cursor: pointer;
              }
              hr {
                border: 0.5px #707070 solid;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              blockquote {
                padding: 0 0.5em;
                margin: 20px 1em;
                border-left: 0.25em solid #dfe2e5;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              pre {
                display: block;
                overflow-x: auto;
                padding: 0.5em;
                background: ${isThemeDark ? '#303030' : '#d0d0d0'};
                border: 1px solid #ddd;
                font-size: 14px;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              pre code {
                font-size: 13px;
                background: ${isThemeDark ? '#303030' : '#d0d0d0'};
                padding: 0px;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              code {
                font-size: 13px;
                background: ${isThemeDark ? '#303030' : '#d0d0d0'};
                padding: 3px 5px;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              mark {
                background-color: #ffff0060;
              }
              summary:focus {
                outline: none;
              }
              table {
                border-collapse: collapse;
                margin: 15px 0px;
              }
              table, th, td {
                border: 1px solid #a1a1a1;
              }
              th, td {
                line-height: 1.5em;
                padding: 10px;
              }
            `}
          </style>
          {user && this.renderSnippetsForSignedInUsers()}
        </Head>
        <body
          style={{
            font: '15px',
            color: isThemeDark ? '#fff' : '#000',
            fontWeight: 300,
            lineHeight: '1.5em',
            padding: '0px 0px 0px 0px !important',
            letterSpacing: '0.01em',
          }}
        >
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
