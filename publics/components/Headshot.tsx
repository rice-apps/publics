
import type {MemberAbout} from "../utils/types"
import Image from "next/image"

type Props = {
    member: MemberAbout

}


const Headshot = (props: Props) =>{
    return (
        <div className="card card-side items-left text-left">
            <div className="card-body">
                <figure className = "object-fill">
                <Image src = {props.member.image_url} width = '200' height = '250' alt = 'team member headshot' className = 'rounded object-fill'></Image>
                </figure>
            
                <h2 className="card-title text-sm md:text-lg">{props.member.name}</h2>
                <p className="font-medium text-primary text-sm sm:text-base" >{props.member.title}</p>
                <p className = "text-sm sm:text-base">{props.member.college}</p>
            </div>
        </div>
    )
    
}
export default Headshot
