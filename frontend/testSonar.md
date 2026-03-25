## After creating a sonarcube project

## 2. Install the sonarScanner using:
```bash
npm install --save-dev sonarqube-scanner
```

## 3. Change the `sonar.token`
in the `sonar-project.properties` use the token you generated with the sonarcube project in the `sonar.token` property

## 4. Execution
to execute the test run `npm run sonar`