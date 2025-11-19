# Site Diary App

## Description

This is a site diary app done in part of an assessment for a company I am applying for

## Live Demo

The application is deployed and available at: [https://site-diary-3qcvdn8a2-meio-vs-projects.vercel.app/](https://site-diary-3qcvdn8a2-meio-vs-projects.vercel.app/)

## Disclaimer - AI Use

**Cursor AI** (powered by Claude) was used extensively throughout this project. It was used to plan architecture, generate boilerplate, and drafting components. Refinements for clarity were manually done after, particularly separating larger components into re-usable modules.

## Installation

To run a copy of this project on your own machine, you'll need:

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- A **Supabase** account and project (free tier works)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd site-diary
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### Step 4: Set Up the Database

Run the complete migration script in your Supabase SQL Editor:

**For a fresh setup**, use the complete migration:

- `schema-complete.sql` - Creates all tables, indexes, constraints, and triggers in one go

### Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Step 6: Build for Production

```bash
npm run build
npm start
```

### Step 7: Deploy to Vercel

This project is configured for deployment on Vercel. The app uses Next.js 15.1.3 (downgraded from 16.0.3) to avoid Turbopack build errors in production. Environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be configured in the Vercel project settings. The build process uses webpack instead of Turbopack for reliable production builds. To deploy, connect your GitHub repository to Vercel or use the Vercel CLI (`vercel --prod`).

## Schema Design
<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/5e7d83ea-8676-4d89-8f02-8b7dd68971ea" />

The project was started by designing the schema:

- SiteDiary - The domain object. Holds references to incidents, resources utilized, visitors
- Visitors - A daily log of visitors, each entry unique to its site diary. For example, Meio Velarde in the diary for November 19th receives a different `visitor_id` from Meio Velarde in the diary for November 18th; both are allowed.
- Resources - Physical assets of the company used for projects. Can be equipment or materials.
- Incidents - Records of incidents tied to a specific Site Diary entry.

### Database Design

To achieve the schema, the following PostgreSQL tables were generated:

- `site_diaries` table - Main diary entries
- `visitors` table - Visitor information with optional fields
- `resources` table - Master list of resources/equipment
- `resource_utilization` table - Links resources to diary entries
- `incidents` table - Incident records
- All necessary indexes for performance
- Foreign key constraints with CASCADE deletes
- Automatic `updated_at` timestamp triggers

## Pages

- New Diary Entry Page - `diary/new` - A page for the creation of a new diary entry. Initial information to create the diary is entered here: date, summary of work done, weather condition, and temperature.
- View Diary Entry Page / Manage Diary - `/diary/id` - A dedicated page to a single diary entry
- Edit Diary Entry Page - `/diary/id/edit` - Edit the initial information entered in the diary (date, description, weather, temperature)

## Component Architecture

Components are organized into logical folders for maintainability:

- **`diary/`** - Diary-specific components (`diary-card`, `diary-form`)
- **`forms/`** - Reusable form components for adding/editing items (`visitor-form`, `equipment-form`, `incident-form`)
- **`lists/`** - List management components with inline editing (`visitors-list`, `equipment-list`, `incidents-list`)
- **`shared/`** - Shared utility components used across the app (`weather-display`, `weather-select`, `resource-combobox`, `utilization-input`, `item-actions`)
- **`dialogs/`** - Dialog/modal components (`confirm-dialog`, `create-resource-dialog`)
- **`ui/`** - Base UI components from ShadCN (Button, Card, Input, Select, etc.)

Key reusable components:

- **`ResourceCombobox`** - Searchable combobox for selecting resources with creation capability
- **`WeatherDisplay`** - Displays weather condition with colored badges and icons
- **`ItemActions`** - Edit and delete action buttons for list items
- **`ConfirmDialog`** - Reusable confirmation dialog for destructive actions

## Implementation Details

- **ShadCN** was used as the main component library for this project
- **Weather Condition**: Implemented via enum/icon mapping under lib/weather.ts. Icons are from lucide react
- **Hooks** were created for common use cases in the app.
  - `useDiaryItems` - Generic hook for fetching diary-related items (visitors, incidents) with CRUD operations
  - `useIncidents / useVisitors` - Implementations of `useDiaryItems to the respective data from Supabase
  - `useResources` - Hook for managing the organization level resources list
  - `useDiary` - Fetches a single diary entry with form data transformation. Used in conjunction with edit diary page
  - `useExpandable` - Manages state of multiple collapsible list items. Used in VisitorsList component
- Performance Optimizations - Several performance issues were observed in the initial implementation. The following were done:
  - Where possible, single queries were used to fetch. Where multiple queries are involved `Promise.all()` was used
  - Sorting, counting, and grouping was done in memory instead of in the database
  - Revalidation cache for the detail pages
- Branding - Branding was implemented last - globals and themes were edited for a clean, modern aesthetic.
- Vercel deployment detail - Webpack favored over Turbopack because of a Node environment error. NextJS was bumped down from v16 to v15 to get around this.

## How I Would Improve The Project (Recommendations)

- UX: I would eliminate the separate create/edit pages and instead use the view page for inline creation and editing. Creating a new diary entry would simply insert a new record with the date, and all other details could then be edited directly inline-similar to how Notion or Google Keep handle this workflow.
- Unit Tests: I would generate unit tests to validate that the following critical app and backend logic is consistent
  - No two diaries can be made for the same day
  - No two visitors can be logged for the same diary entry
  - ComboBox can search for Resources
  - The same Resource cannot be searched for in the ComboBox if it is already in the diary
  - Backend returns the correct 4xx status codes for the above errors.
  - Use Crud List Hook correctly adds and resets its inline forms when the appropriate buttons are clicked (add, edit, cancel)
  - Use Delete Dialog prompts user for critical database deletions
  - Use Diary fetches a diary entry and sets the app diary state
- Images - For CRUD operations, `useDiaryItems` can handle image metadata (requires an `images` table with `site_diary_id`, `id`, `url`, `created_at`). However, file upload to Supabase Storage is a separate concern that needs additional implementation (using `supabase.storage.from('bucket').upload()`). UI-wise, a simple image dropzone/drag-and-drop component can be implemented.
- PageSpeed insights - Tools like pagespeed insights have not been used on the project yet so could use an iteration.
- Loading - Pages are interactible while loading. This causes some glitches. Some loading visual indicators would help usability.
- Logo and favicon was generated via AI - a high quality SVG would be better
- **Stretch Goals** - I am a fan of how [DailyBean](https://play.google.com/store/apps/details?id=com.bluesignum.bluediary) structures their entries. The main list is a calendar view and clicking a calendar entry pulls up its card and link to the view page near the bottom.
