import {
  AccountSelector,
  ConnectionBanner,
  WalletConnector,
} from '@/components'
import { Toaster } from '@/components/ui'
import {
  useConnectionContext,
  useTransactionToasts,
  useWalletContext,
} from '@/hooks'

import './App.css'

export default function App() {
  const { isConnected: isWalletConnected } = useWalletContext()
  const { isConnected: isChainConnected } = useConnectionContext()

  // Initialize transaction toasts
  useTransactionToasts()

  if (!isWalletConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <WalletConnector />
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-card border-border flex w-64 flex-col border-r shadow-lg">
        {/* Header */}
        <div className="text-foreground border-border from-muted/20 to-muted/40 flex items-center gap-3 border-b bg-gradient-to-br p-4">
          <svg
            width="527"
            height="475"
            className="h-9 w-9 lg:h-10 lg:w-10"
            viewBox="0 0 527 475"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_2967_1780)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M50.1577 1.40557C27.1637 6.66957 8.60966 24.6316 2.17266 47.8576C-5.75034 76.4516 8.61866 108.649 35.1387 121.725C46.3367 127.247 55.8617 129.213 68.1047 128.531C84.1327 127.638 98.6727 121.251 109.64 110.284L115.062 104.862H263.192H411.322L416.871 110.411C427.882 121.421 442.022 127.635 458.105 128.531C477.164 129.593 493.614 123.368 507.123 109.983C519.652 97.5666 526.105 82.0656 526.105 64.3816C526.105 46.7606 519.72 31.4626 507.048 18.7236C481.588 -6.87143 439.954 -6.13043 414.965 20.3636L411.665 23.8616L263.135 23.8456L114.605 23.8306L109.846 18.9376C98.5527 7.32557 83.5967 0.864571 66.6547 0.277571C60.1697 0.0525712 54.3177 0.45257 50.1577 1.40557Z"
                fill="var(--line-color)"
                fill-opacity="0.987"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M50.7802 174.489C32.2772 178.459 15.4542 191.322 7.08515 207.901C-3.20085 228.278 -2.00785 253.064 10.1872 272.375C17.7112 284.287 31.0612 294.365 46.1052 299.489C54.5752 302.373 75.2982 302.115 84.1052 299.015C100.111 293.381 113.699 281.991 120.856 268.21C126.319 257.692 128.377 249.467 128.451 237.862C128.525 226.197 127.085 219.856 121.864 208.862C118.615 202.021 116.244 198.782 109.716 192.265C93.5842 176.161 72.5542 169.818 50.7802 174.489Z"
                fill="var(--line-color)"
                fill-opacity="0.987"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M251.103 173.815C227.976 178.202 208.122 195.296 201.043 216.912C198.91 223.423 198.61 226.126 198.661 238.362C198.714 251.052 198.967 252.993 201.362 259.099C209.348 279.464 223.572 292.812 244.603 299.679C248.128 300.83 253.29 301.317 262.103 301.329C272.679 301.344 275.744 300.972 282.018 298.913C302.396 292.224 319.273 274.045 324.769 252.862C326.953 244.446 326.956 230.297 324.775 221.862C319.192 200.262 301.385 181.749 280.103 175.419C273.624 173.492 257.504 172.6 251.103 173.815Z"
                fill="var(--line-color)"
                fill-opacity="0.987"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M448.107 174.417C430.049 178.295 412.186 192.356 404.347 208.862C399.126 219.856 397.686 226.197 397.76 237.862C397.87 255.16 404.229 270.874 415.805 282.45C427.731 294.376 441.684 300.68 458.194 301.6C486.191 303.161 511.7 286.848 521.897 260.862C525.105 252.686 526.054 247.352 526.082 237.342C526.165 206.703 504.92 180.655 474.767 174.427C465.639 172.541 456.855 172.538 448.107 174.417Z"
                fill="var(--line-color)"
                fill-opacity="0.987"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M50.2735 347.395C21.3785 353.667 0.105469 380.367 0.105469 410.362C0.105469 428.027 6.51648 443.393 19.1385 455.983C32.3545 469.165 48.9395 475.536 67.6055 474.601C83.6225 473.799 98.9815 466.958 109.847 455.786L114.606 450.893H263.106H411.606L416.365 455.786C427.23 466.958 442.589 473.799 458.606 474.601C477.236 475.534 493.787 469.185 507.141 455.983C513.509 449.688 515.64 446.709 519.394 438.862C524.751 427.662 526.106 421.844 526.106 410.043C526.106 392.786 519.62 377.361 507.049 364.724C482.112 339.655 441.431 339.682 416.606 364.783L411.606 369.839L263.222 369.85L114.839 369.862L110.089 365.036C94.8555 349.562 71.7235 342.739 50.2735 347.395Z"
                fill="var(--line-color)"
                fill-opacity="0.987"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_2967_1780">
                <rect width="527" height="475" fill="var(--line-color)"></rect>
              </clipPath>
            </defs>
          </svg>
          <div className="text-left">
            <h1 className="text-foreground mt-1.5 text-xl leading-4 font-bold">
              QF Network
            </h1>
            <p className="text-muted-foreground text-sm">Asset Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4"></nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Connection status banner */}
        <ConnectionBanner />

        {/* Header with account selector */}
        <header className="border-border bg-background/80 border-b backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isChainConnected ? 'bg-green-500' : 'bg-destructive'
                }`}
              ></div>
              <span className="text-muted-foreground text-sm font-medium">
                {isChainConnected
                  ? 'Connected to QF Network'
                  : 'Disconnected from QF Network'}
              </span>
            </div>
            <AccountSelector />
          </div>
        </header>
      </div>

      <Toaster toastOptions={{ duration: 30_000 }} />
    </div>
  )
}
