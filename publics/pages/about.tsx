
import Headshot from "../components/Headshot";


const About = () => {
    
    const teamMembers = [
        {image_url : "https://placeimg.com/400/225/arch",
        name : "Angus",
        title : "Team Lead",
        college : "Brown",
        },
        {image_url : "https://placeimg.com/400/225/arch",
        name : "Aidan",
        title : "Team Lead",
        college : "Baker",
        }
    ]
    return(
        <div>
            <h1>About Publics</h1>
            <p>RiceApps designed and developed the 
                Publics application to streamline the public party 
                registration and volunteer management process at Rice.
            </p>

            <div>
                <h4>Meet the Team</h4>
                <div className = 'grid grid-cols-4 grid-rows-3'>
                {teamMembers.map((member) => 
                   <Headshot member={member} />)}
                </div>
            </div>
        </div>
    )
    
    
};

        
export default About;