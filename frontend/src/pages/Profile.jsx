import { useState } from 'react'
import Title from '../components/Title'

const Profile = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")

    const onSubmit = async()=>{

    }
  return (
    <div className='border-t pt-16'>
       <div className='text-2xl'>
            <Title text1={'MY'} text2={'PROFILE'}/>
        </div>

        <form className="text-gray-800 w-full sm:w-2/3 lg:w-1/2 pt-4" onSubmit={onSubmit}>
          {/* <div> */}
          <div>
            <input
              type="text"
              className="inputBox px-3 w-full py-3 rounded-lg border drop-shadow outline-slate-500 "
              placeholder="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="email"
              className="inputBox px-3 w-full py-3 rounded-lg border drop-shadow outline-slate-500 my-5"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="text"
              className="inputBox px-3 w-full py-3 rounded-lg border drop-shadow outline-slate-500 mb-5"
              placeholder="Your phone no."
              minLength={10}
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <textarea
              type="text"
              className="inputBox px-3 h-32 w-full py-3 rounded-lg border drop-shadow outline-slate-500 mb-5"
              placeholder="Your address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <input
              type="file"
              className="inputBox px-3 w-full py-3 rounded-lg border drop-shadow outline-slate-500 mb-5"
              accept="image/*"
            //   ref={fileInputRef}
            //   onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            className="inputBox w-full py-[10px] mt-5 border rounded-3xl bg-gray-800 hover:bg-black text-white font-semibold"
          >
            Save
            {/* {loading ? <SmallSpinner /> : "Save"} */}
          </button>
        </form>
    </div>
  )
}

export default Profile
