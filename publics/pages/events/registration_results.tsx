type EventDetails = {
    eventName: string,
}
function ResultPage(props: EventDetails) {
    return (
        <div key = "registration_results_page">
            <div key = "event_title">
                <h1>{props.eventName}: Event Results</h1>
            </div>
            <div className="btn-group btn-group-vertical lg:btn-group-horizontal">
                <button className="btn">Copy Emails</button>
                <button className="btn">Add Attendee</button>
            </div>
            <div className="overflow-x-auto">
            <table className="table table-compact w-full">
                <thead>
                <tr>
                    <th></th> 
                    <th>Date and Time</th> 
                    <th>First Name</th> 
                    <th>Last Name</th> 
                    <th>Email Address</th> 
                    <th>NetID</th> 
                    <th>Residentail Colleger</th>
                    <th>Wristband?</th>
                </tr>
                </thead> 
                <tbody>
                <tr>
                    <th></th> 
                    <td>10/19/2022 12:00PM</td> 
                    <td>Rebecca</td> 
                    <td>Yee</td> 
                    <td>rmy3@rice.edu</td> 
                    <td>rmy3</td> 
                    <td>Wiess</td>
                    <td><input type="checkbox" className="checkbox checkbox-primary" /></td>
                </tr>
                </tbody> 
            </table>
            </div>
        </div>
    );
}

//Used for testing purposes
function Page() {
    return (
        <div>
            <ResultPage eventName={"Sid 80's"}></ResultPage>
        </div>
    );
}

export default Page;