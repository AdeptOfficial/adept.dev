import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Profile = () => {
    return (
        <div>
            <div id="profile__img" className="flex justify-center -mt-8 flex-col">
                <img src="src/img/profile.png" className="rounded-full border-solid border-white border-2 -mt-8 object-cover scale-50 origin-top -translate-y-48"/>		
            </div>

            <div id="profile__info" className="text-center px-3 -translate-y-96 scale-150">
                <h3 className="text-white text-sm bold font-sans -translate-y-28">Leland Moy</h3>
                <p className="mt-2 font-bold font-sans text-white -translate-y-28">Software Engineer</p>
            </div>

            <div id="profile__socials" className="flex justify-center pb-3 text-white scale-125 -translate-y-96 pt-6">
                <div id="profile__email"  className="text-center mr-3 border-r pr-3 -translate-y-28" >
                    <a className="text-white" href='mailto:Leland.d.moy@gmail.com'>
                        <h2>Email</h2>
                        <span><EmailIcon/></span>
                        </a>
                </div>

                <div id="profile__github" className="text-center mr-3 border-r pr-3 -translate-y-28">
                    <a className="text-white" href='https://github.com/AdeptOfficial'>
                        <h2>Github</h2>
                        <span><GitHubIcon/></span>
                    </a>
                </div>

                    <div id="profile__linkined" className="text-center mr-3 border-r pr-3 -translate-y-28">
                        <a className="text-white" href='https://www.linkedin.com/in/leland-moy/'>
                            <h2 >LinkedIn</h2>
                            <span ><LinkedInIcon/></span>
                        </a>
                    </div>

                <div id="profile__discord" className="text-center -translate-y-28">
                    <a className="text-white" href='https://discord.gg/xYW8hsesjt'>
                        <h2>Discord</h2>
                        <span><i className="material-icons text-3xl -translate-y-1">discord</i></span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Profile
