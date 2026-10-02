# Clearspace — Angular conversion

This project is the Angular conversion of the supplied `budget-tracker` React/Vite project.

## Run

```powershell
npm install
npm start
```

Then open the Angular dev-server URL (normally `http://localhost:4200`).

## Build

```powershell
npm run build
```

## API

The app starts with local demo data, matching the React project's behavior. Open **Settings → API connection** and enter your ASP.NET API URL, for example `http://localhost:5264`, then test the connection.

## Structure

The Angular project keeps the original conceptual structure: `components/ui`, `hooks`, `lib`, `pages`, `public`, and app-level routing/state/services. React hooks and Radix UI primitives have been replaced with Angular signals/services and lightweight Angular UI wrappers.

The supplied React ZIP is also retained as `original-react-project.zip` for reference while comparing the conversion.
