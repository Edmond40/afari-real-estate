

function Settings(){

    function handleSubmit(event){

        event.target.name
    }


    return(
        <div>
            <div className="bg-gray-100 p-7 rounded-md shadow-md m-4">

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-base font-semibold text-gray-700">Notification Preferences</h1>
                        <div className="flex items-center justify-between">
                            <label htmlFor="email">Email Notifications</label>
                            <input type="checkbox" name="email" id="" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label htmlFor="sms">SMS Notifications</label>
                            <input type="checkbox" name="sms" id="" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-base font-semibold text-gray-700">Privacy Settings
                        </h1>

                        <div className="flex items-center justify-between">
                            <label htmlFor="profile">Public Profile</label>
                            <input type="checkbox" name="sms" id="" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label htmlFor="contact">Show Contact Information</label>
                            <input type="checkbox" name="sms" id="" />
                        </div>
                    </div>

                    <button className="bg-blue-500 text-gray-50 p-2 rounded-md hover:bg-blue-600 duration-300" type="submit">Save Settings</button>
                </form>
            </div>
        </div>
    )
}

export default Settings;