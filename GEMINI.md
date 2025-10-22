# GEMINI.md

## Project Overview

This project is a web application called "QF Network Manager". It serves as a tool for managing assets on the QF Network, which is a Polkadot-based blockchain. The application allows users to connect their Polkadot wallet to perform various asset-related operations.

The core functionalities of the QF Network Manager include:

- Connecting to a Polkadot wallet.
- Viewing a list of existing assets.
- Creating new assets on the network.
- Minting new tokens for a specific asset.
- Transferring tokens between accounts.
- Destroying assets.

The application is built with a modern frontend stack, ensuring a responsive and efficient user experience.

## Technologies Used

- **Frontend Framework:** React with TypeScript
- **Build Tool:** Vite
- **Blockchain Interaction:** `polkadot-api` for connecting to the QF Network.
- **Styling:** Tailwind CSS with `lucide-react` for icons.
- **UI Components:** `sonner` for notifications.
- **Data Fetching & State Management:** TanStack Query (`@tanstack/react-query`)

## Building and Running the Project

To get the project up and running, follow these steps:

1.  **Install Dependencies:**
    The project uses `pnpm` as the package manager.

    ```bash
    pnpm install
    ```

2.  **Run the Development Server:**
    This command will start a local development server.

    ```bash
    pnpm dev
    ```

3.  **Build for Production:**
    This command will build the application for production.

    ```bash
    pnpm build
    ```

4.  **Lint the Code:**
    This command will run the linter to check for code quality.

    ```bash
    pnpm lint
    ```

5.  **Preview the Production Build:**
    This command will serve the production build locally for previewing.
    ```bash
    pnpm preview
    ```

## Development Conventions

- **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
- **State Management:** TanStack Query is used for managing server state (data fetched from the blockchain).
- **Code Quality:** ESLint is configured to enforce code quality and consistency.
- **Component Structure:** The application is structured into reusable React components located in the `src/components` directory.
- **Blockchain Interaction:** All interactions with the QF Network are handled through the `polkadot-api` library, with the client configured in `src/lib/qfnetwork.ts`.
