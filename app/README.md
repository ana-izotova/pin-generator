## PIN Generator & Validator

A take-home assignment extension: a UI which generates and validates PINs against configurable rules.

### Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npx vitest         # run tests
```

### Project structure

```
app/
  page.tsx                  # landing page
  pin-generator/page.tsx    # generate PINs with configurable constraints
  pin-validator/page.tsx    # validate a PIN against selected rules

utils/
  generate-pins/            # generation logic + tests
  validate-pin/             # validation rules + composable validator + tests
  shuffle/                  # Fisher-Yates shuffle + tests
```
