
import type {MemberAbout} from "../utils/types"
type Props = {
    member: MemberAbout
    /*
    image_url: string
    name: string
    title: string
    college: string
    */

}


const Headshot = (props: Props) =>{
    return (
    <div className="card w-200 h-250">
        <figure className="px-0 pt-0 w-200 h-250">
            <img src= {props.member.image_url} className="rounded-xl object-fill" />
        </figure>
        <div className="card-body items-left text-left">
            <h2 className="card-title"></h2>
            <p>{props.member.name}</p>
            <p>{props.member.title}</p>
            <p>{props.member.college}</p>
        </div>
    </div>
    )
    
}
export default Headshot