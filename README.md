# Docuport Automation — TDD (Playwright + JavaScript)

UI test automation for **Docuport** (https://beta.docuport.app), built with **Playwright Test** in JavaScript.
The framework uses the **Page Object Model (POM)**, custom **fixtures**, **environment files** for URLs and credentials, and **JSON test data** for expected results.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Project structure](#project-structure)
5. [How the framework works](#how-the-framework-works)
6. [Tests](#tests)
7. [Running tests](#running-tests)
8. [Environments](#environments)
9. [Reports](#reports)
10. [Git workflow](#git-workflow)
11. [CI — Jenkins](#ci--jenkins)
12. [Troubleshooting](#troubleshooting)

---

## Tech stack

| Tool | Why it is here |
|---|---|
| **Node.js** (LTS) | Runs JavaScript outside the browser |
| **Playwright Test** | Test runner + browser automation |
| **dotenv** | Loads URL + credentials from `.env.<env>` into `process.env` |
| **cross-env** | Sets `TEST_ENV` / `HEADLESS` the same way on Mac, Linux and Windows |
| **allure-playwright** + **allure-commandline** | Allure HTML report (needs **Java 8+**) |

---

## Prerequisites

Run each command in a terminal. A version number means it is installed.

```bash
node -v      # v20 or newer
npm -v
npx -v
git -v
java -version   # only for Allure
```

---

## Setup

### 1. Clone and open

```bash
git clone <repo-url>
cd b#-docuport-automation-tdd-js
code .
```

### 2. Install packages + browser

```bash
npm install
npx playwright install chromium
```

### 3. Create `.env.beta` in the project root

Ask your instructor for the real values. **Never commit this file.**

```
# KEY=value — no quotes, no spaces around =
DOCUPORT_BASE_URL=https://beta.docuport.app
DOCUPORT_CLIENT_USERNAME=<client username>
DOCUPORT_CLIENT_PASSWORD=<client password>
DOCUPORT_EMPLOYEE_USERNAME=<employee username>
DOCUPORT_EMPLOYEE_PASSWORD=<employee password>
DOCUPORT_ADVISOR_USERNAME=<advisor username>
DOCUPORT_ADVISOR_PASSWORD=<advisor password>
DOCUPORT_SUPERVISOR_USERNAME=<supervisor username>
DOCUPORT_SUPERVISOR_PASSWORD=<supervisor password>
```

### 4. Check it works

```bash
npm run test:all
```

---

## Project structure

```
b#-docuport-automation-tdd-js/
├── data/
│   ├── beta_data.json             # expected data for beta: roles, left menu, invalid logins
│   └── pre_data.json              # same shape, pre values
├── pages/                         # page objects (POM)
│   ├── BasePage.js                # page, locator(), left menu — every page extends it
│   ├── LoginPage.js               # login, loginAs(role), getCredentialsFor(role), verifyMessage
│   ├── HomePage.js                # continue button, profile icon, verifyHomePageFor(role)
│   └── ReceivedDocsPage.js        # page heading, verifyPageIsOpen()
├── tests/
│   └── login/
│       ├── login-logout.spec.js   # Tests 1–10
│       └── login-describe.spec.js # same tests grouped with describe + beforeEach
├── utilities/
│   ├── beta-data-reader.js        # reads data/<env>_data.json → appInfo
│   └── docuport-ui-utilities.js   # fixtures (testBase, testLoggedIn) + CommonUI
├── .env.beta                      # NOT in Git — URL + credentials
├── .env.pre                       # NOT in Git
├── .gitignore
├── package.json                   # scripts + packages
└── playwright.config.js           # loads .env, baseURL, browser, reporters
```

Generated after a run (not in Git): `playwright-report/`, `test-results/`, `allure-results/`, `allure-report/`, `screenshots/`.

---

## How the framework works

### Two places for data

| | Where | In Git? |
|---|---|---|
| **Secrets**: URL, usernames, passwords | `.env.beta`, `.env.pre` | ❌ never |
| **Expected data**: roles, left menu, messages | `data/beta_data.json`, `data/pre_data.json` | ✅ yes |

### Page Object Model

- **`BasePage`**: holds `page`, a `locator()` helper and the **left menu** (`getLeftMenuItems()`, `navigateTo(item)`). It cannot be created directly.
- Every page **extends `BasePage`** and keeps only its own locators and methods.
- Tests call **methods**, not raw locators.

### Login by role

```js
await loginPage.loginAs("advisor");
```

`getCredentialsFor(role)` does two checks:
1. Is the role in `appInfo.roles` (from `beta_data.json`)? If not, the error lists the valid roles.
2. Are `DOCUPORT_<ROLE>_USERNAME` and `DOCUPORT_<ROLE>_PASSWORD` set in `.env`? If not, the error names the missing keys.

### Fixtures — `utilities/docuport-ui-utilities.js`

| Fixture | What you get |
|---|---|
| `test` from `@playwright/test` | A blank page. The test does its own `goto` |
| **`testBase`** | Docuport already open, title checked, **screenshot saved if the test fails** |
| **`testLoggedIn`** | `testBase` + already logged in. Role defaults to `client`; change it with `testLoggedIn.use({ role: "advisor" })` |

```js
import { testBase, testLoggedIn, expect, CommonUI } from "../../utilities/docuport-ui-utilities.js";

testLoggedIn("starts on Home", async ({ loggedInPage }) => {
  // ask for loggedInPage — { page } alone does NOT log in
});
```

### CommonUI — reusable static helpers

- `CommonUI.loginAs(page, role)`: log in and verify Home
- `CommonUI.getLeftMenuFor(role)`: expected menu from `beta_data.json`
- `CommonUI.logout(page)`: log out and verify the login page

---

## Tests

All in `tests/login/login-logout.spec.js`:

| Test | Tag | What it shows |
|---|---|---|
| Test 1 | `@test1` | Login with hard-coded locators, no POM |
| Test 2 | `@test2` | Same login using `LoginPage` + `HomePage` |
| Test 3 | `@test3` | One `login(username, password)` method |
| Test 4 | `@dataTableLogin` `@smoke` | Credentials from a data object |
| Test 5 | `@test5` | `loginAs(role)` with credentials from `.env` |
| Test 6 | `@test6` | `testBase` fixture + CommonUI, left menu actual vs expected |
| Test 7 | `@test7` `@smoke` | Data-driven loop: every role's left menu |
| Test 8 | `@test8` | `testLoggedIn` fixture: starts logged in (client + advisor) |
| Test 9 | `@test9` `@smoke` | Invalid logins from `beta_data.json` → error messages |
| Test 10 | `@test10` | Navigate with the left menu → Received docs |

`login-describe.spec.js` groups tests with `test.describe` + `test.beforeEach`.

---

## Running tests

| Command | What it does |
|---|---|
| `npm run test:all` | Every test |
| `npm run test:file` | `login-logout.spec.js` only |
| `npm run test:headed` | Browser window open |
| `npm run test:headless` | No browser window |
| `npm run test:beta` | Against **beta** |
| `npm run test:pre` | Against **pre** |
| `npm run test:tag -- @test9` | One tag |
| `npm run test:smoke` | `@smoke` tests |
| `npm run test:roles` | `@test7` |
| `npm run test:invalid` | `@test9` |
| `npm run test:no-smoke` | Everything except `@smoke` |
| `npm run html:report` | Open the Playwright HTML report |

### Extra Playwright options

Add them after `--`:

```bash
npm run test:pre -- --grep @test9 --workers=2 --retries=1 --headed
```

| Option | Meaning |
|---|---|
| `--grep @tag` | Only tests with that tag |
| `--grep-invert @tag` | Everything except that tag |
| `--workers=2` | 2 tests at the same time |
| `--retries=1` | Retry a failed test once |
| `--project=chromium` | Pick the browser |
| `--headed` | Show the browser window |

> ⚠️ Workers share the same 4 accounts. That's fine for login and menu tests, but not for tests that change data.

---

## Environments

`playwright.config.js` and `beta-data-reader.js` both read `TEST_ENV`:

```js
const ENV = process.env.TEST_ENV || "beta";
dotenv.config({ path: `.env.${ENV}`, override: true, quiet: true });
// → .env.beta + data/beta_data.json  (default)
// → .env.pre  + data/pre_data.json   (TEST_ENV=pre)
```

Set it **before** the command:

```bash
# any OS
npx cross-env TEST_ENV=pre npm run test:all
# Mac / Linux
TEST_ENV=pre npm run test:all
# Windows PowerShell
$env:TEST_ENV="pre"; npm run test:all
```

> ❌ `npx playwright test TEST_ENV=pre` reads `TEST_ENV=pre` as a file filter → *No tests found*.

**Add an environment:** create `.env.<env>` + `data/<env>_data.json`, then add a `test:<env>` script.

---

## Reports

### Playwright HTML report

```bash
npm run test:all
npm run html:report
```

### Allure report (needs Java 8+)

```bash
npm run test:all          # 1. writes allure-results/
npm run allure:generate   # 2. builds allure-report/
npm run allure:open       # 3. opens it in the browser
# or 2 + 3 together:
npm run allure:serve
```

> Don't double-click `allure-report/index.html`. It needs a server, so use `allure:open` or `allure:serve`.

### Failure evidence

- **Screenshot**: saved to `screenshots/` by the `testBase` fixture when a test fails.
- **Trace**: recorded on the first retry (`trace: 'on-first-retry'`). Open it from the HTML report.

---

## Git workflow

| Branch | Purpose |
|---|---|
| `main` | Stable, released code |
| `develop` | Integration branch: features merge here |
| `feature/<story-id>` | One branch per Jira story |

For each story:

```bash
git switch develop
git pull
git switch -c feature/DP-101
# … write the test …
git add .
git commit -m "DP-101 login test for advisor"
git push -u origin feature/DP-101
# → open a Pull Request into develop on GitHub
```

First time on a computer:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## CI — Jenkins

Freestyle job, **source code** = this repository.

### `.env.beta` is not in Git

Add it to Jenkins once:
**Manage Jenkins → Credentials → + Add Credentials → Secret file** → upload `.env.beta` → **ID** `docuport-env-beta`.

In the job: **Build Environment → Use secret text(s) or file(s) → Secret file** → variable `ENV_FILE` → credential `docuport-env-beta`.

### Build step — Mac / Linux (Execute shell)

```bash
cp "$ENV_FILE" .env.beta
npm ci
npx playwright install chromium
npx cross-env TEST_ENV=beta HEADLESS=1 npx playwright test
```

### Build step — Windows (Execute Windows batch command)

```bat
copy /Y "%ENV_FILE%" .env.beta
call npm ci
if errorlevel 1 exit /b 1
call npx playwright install chromium
if errorlevel 1 exit /b 1
call npx cross-env TEST_ENV=beta HEADLESS=1 npx playwright test
if errorlevel 1 exit /b 1
```

### Post-build actions

- **Publish HTML reports**: directory `playwright-report`, index page `index.html`
- **Allure Report**: results path `allure-results`

> More environments: add one Secret file per env file (`.env.pre` → `docuport-env-pre`), copy the job, then change the credential, the copy line and `TEST_ENV`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `No login for "client"` | Key missing in `.env.beta` → add `DOCUPORT_CLIENT_USERNAME` / `_PASSWORD` |
| `Unknown role "clien"` | Typo, or the role is missing from `roles` in `beta_data.json` |
| `No tests found` | `TEST_ENV=…` placed after the command. Put it before |
| `page.goto: invalid URL` | `.env.beta` not loaded. Check the file name and the `dotenv.config` path |
| Test starts on the login page | Asked for `{ page }` instead of `{ loggedInPage }` |
| `npm: command not found` in Jenkins | Node is not on Jenkins' PATH (Mac: `PATH+EXTRA`; Windows: restart the Jenkins service) |
| Allure: `java: command not found` | Install Java 8+ |