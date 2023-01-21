
import Headshot from "../components/Headshot";


const About = () => {
    
    const teamMembers = [
        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Angus",
        title : "Team Lead",
        college : "Brown",
        },
        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Aidan",
        title : "Team Lead",
        college : "Baker",
        },

        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Gabby",
        title : "Product Manager",
        college : "Brown",
        },
        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Rebecca",
        title : "Designer",
        college : "Wiess",
        },
        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Daniel",
        title : "Developer",
        college : "Wiess",
        },
        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Divya",
        title : "Developer",
        college : "College",
        },
        {image_url : "https://t4.ftcdn.net/jpg/03/62/54/67/360_F_362546707_5p8VrfGOdalokB3gjrTIEAKBrAJb89E3.jpg",
        name : "Elaine",
        title : "Developer",
        college : "Wiess",
        }
    ]
    return(
        <div>
            
            <div className = "p-8 ">
                <article className = "prose">
                <h1 className = "title pb-4">About Publics</h1>
                <p>RiceApps designed and developed the 
                    Publics application to streamline the public party 
                    registration and volunteer management process at Rice.
                </p>
                </article>
                
            </div>
            

            <div>
            <div className = "p-8 ">
                <article className = "prose">
                    <h4>Meet the Team</h4>
                </article>
            </div>
            
                <div className="px-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {teamMembers.map((member) => 
                    <Headshot member={member} />)}
                </div>
                
            </div>
        </div>
    )
    
    
};

        
export default About;
