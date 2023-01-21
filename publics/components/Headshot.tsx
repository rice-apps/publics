
import type {MemberAbout} from "../utils/types"
type Props = {
    member: MemberAbout

}


const Headshot = (props: Props) =>{
    return (
        <div className="card card-side items-left text-left">
            <div className="card-body">
                <figure className = "object-fill">
                <img src= {props.member.image_url} className="rounded object-fill" /> </figure>
                <h2 className="card-title">{props.member.name}</h2>
                <p>{props.member.title}</p>
                <p>{props.member.college}</p>
            </div>
        </div>
    )
    
}
export default Headshot
