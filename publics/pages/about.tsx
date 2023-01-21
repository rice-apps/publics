
import Headshot from "../components/Headshot";

const About = () => {
    
    const teamMembers = [
        {image_url : "/headshots/angus.jpg",
        name : "Angus Jelinek",
        title : "Tech Lead",
        college : "Brown College",
        },
        {image_url : "/headshots/aidan.JPG",
        name : "Aidan Gerber",
        title : "Tech Lead",
        college : "Baker College",
        },

        {image_url : "/headshots/randomwiessguy.jpg",
        name : "Gabby Franklin",
        title : "Product Manager",
        college : "Brown College",
        },
        {image_url : "/headshots/rebecca.JPG",
        name : "Rebecca Yee",
        title : "Designer",
        college : "Wiess College",
        },
        {image_url : "/headshots/randomwiessguy.jpg",
        name : "Daniel Gu",
        title : "Developer",
        college : "Wiess College",
        },
        {image_url : "/headshots/divya.jpg",
        name : "Divya Wagh",
        title : "Developer",
        college : "College",
        },
        {image_url : "/headshots/elaine.jpg",
        name : "Elaine Ye",
        title : "Developer",
        college : "Wiess College",
        },
        {image_url : "/headshots/randomwiessguy.jpg",
        name : "Emma Li",
        title : "Developer",
        college : "Jones College",
        },
        {image_url : "/headshots/randomwiessguy.jpg",
        name : "Evan Stegall",
        title : "Developer",
        college : "Hanszen College",
        },
        {image_url : "/headshots/nithya.jpg",
        name : "Nithya Ramcharan",
        title : "Developer",
        college : "Lovett College",
        },
        {image_url : "/headshots/shivam.jpg",
        name : "Shivam Pathak",
        title : "Developer",
        college : "Sid Richardson College",
        },
        {image_url : "/headshots/tim.jpg",
        name : "Tim Han",
        title : "Developer",
        college : "Brown College",
        }
    ]
    return(
        <div>
            <div className = "md:px-28 px-12 pt-10">
                <article className = "prose">
                <h1 className = "title pb-7">About PartyOwl</h1>
                <div className = "max-w-screen-md">
                <p>RiceApps designed and developed the PartyOwl application to streamline the public party registration and volunteer management process at Rice.
                </p>
                </div>
                </article>
            </div>
            
            <div>
            <div className = "md:px-28 px-12 pt-10">
                <article className = "prose">
                    <h4>Meet the Team</h4>
                </article>
            </div>
                <div className="px-4 md:px-20 grid grid-cols-2 md:grid-cols-4 gap-4 ">
                    {teamMembers.map((member) => 
                    <Headshot key={member.name} member={member} />)}
                </div>
                
            </div>
        </div>
    )
    
    
};

        
export default About;
