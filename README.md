1. First, navigate to the project's directory, then install the dependencies usgin your preferred package manager, I personally used `npm`, using one of the following commands

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `Postgresql` database and a user with all privileges and take the database connection url and add it to the .env file, the database connection url must include the server address of the database, username and password, for example, `postgresql://myuser:mypassword@localhost:5432/mydb?schema=public`

3. After that, run the following commands to generate the database schema and create the migrations:

```bash
npx prisma generate
npx prisma migrate dev --name migration
```

4. Finally, run one of the following commands to run the server (`npm` recommended):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Time Frame

The backend project took around 2 days, the configuration of the project took a significant portion of that, the rest was easy

## Note!

It is worth mentioning that each project could have been perfected more but I happened to be quite busy this week that's why I couldn't give it my all
