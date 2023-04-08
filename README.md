# Party Owl

### How to Run
###### Node.JS and npm Installation
This app requires node.js and npm. 
- Windows
Navigate to the node.js official [download link](https://nodejs.org/en/download) and download the windows installer. Run the installer and add any configurations you want. 
- MacOS/Linux
If you have brew installed, then you can simply run: ```brew install node``` on the command line. 
If you don't have brew installed, then you can either install it (which is recommended as it's very quick and very useful!) or you can navigate to the offical download link above and you can find an installer for your OS. 
###### Repo
After you have installed node and npm, simply clone the repo into a directory of your choosing.
###### Supabase 
This app uses supabase for its backend. Specifically, it uses two supabase instaces, with a simple PROD/DEV split. You will need to do a couple things to use these instances. The dev backend can be changed freely to test and debug during development without fear of affecting the public-facing site. 
- Add Contributors for Backend

If you already have access to the supabase, you can invite new users by navigating to "Authentication" and clicking on the Users tab. On the right you can will se an "+ Invite" button. Click on this and add the email of the person you wish to invite. If you don't have access, ask your team leads. If you are a team lead and don't have access, try and get in touch with whoever worked on the project last and see if they can help. 
- Env 

Add an .env file in the publics/publics directory, and add your environment variables here. Ask your team lead for these. You will change this based on which backend (prod/dev) you are using. They will be in the form of: 
```
NEXT_PUBLIC_SUPABASE_URL = {your url}
NEXT_PUBLIC_SUPABASE_ANON_KEY = {your anon key}
```
Make sure you're using the correct backend! Don't push to prod if you don't mean to!
###### Running the App
Now that everything is installed, simply navigate to publics/publics and run ```npm run dev``` (Run scripts found at package.json as per usual). This will launch a local instance of the app that will try to run at ```localhost:3000```. If successful, you can view the app at this url. 

## Great, I'm all set up - but now I want to make changes. Anything I should be aware of?
Thanks for asking! Yes, there is just one thing: make sure to create a NEW BRANCH before making changes! We will use the `main` branch for production; so this branch will not be directly editable. Furthermore, it is just good practice in development to not make direct changes to production or staging branches. Instead, it is advisable to create a new branch when you'd like to build a new feature, and then use a Pull Request to merge your changes into the deployed version.

The typical workflow will look like this:
1. Create a new branch using `git checkout -b feature/<CUSTOM_BRANCH_NAME>`, and replace <CUSTOM_BRANCH_NAME>.
2. Make your necessary commits, and once they're ready to be integrated with the deployed version, submit a pull request on Github.
3. From there, your mentor will review the PR. They may recommend some changes or revisions that should be made, and in that case you will need to make another commit or two before the PR is approved. 
4. Once the PR is approved, the mentor will merge your PR into the deployed version, and now your code will be integrated in the deployed version of PartyOwl. Congratulations!

# What if I want to make changes to the Database.
If you need to change the database schema you'll need to create a database migration, since the production project can not be edited directly. Currently we are only usisng manual migrations; meaning you'll need to write DDL statements manually into a migration file, however in future we hope to use a migration manager. Our git actions will automatically apply the diff when you merge the commit with a new migration.

### Testing

Run `npm run test` in the /publics directory to run the tests.
