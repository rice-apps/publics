# Party Owl

## Testing

Run `npm run test` in the /publics directory to run the tests.

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
