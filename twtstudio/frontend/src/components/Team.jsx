import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const Team = () => {
  const { theme } = useTheme();

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Growth strategy expert with 10+ years experience",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Sarah Williams",
      role: "CTO",
      bio: "Technology architect and full-stack developer",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Michael Chen",
      role: "Head of Design",
      bio: "UX/UI specialist focused on conversion optimization",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      bio: "Digital marketing and brand strategy expert",
      image: "https://randomuser.me/api/portraits/women/63.jpg",
    },
  ];

  const mentors = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Growth strategy expert with 10+ years experience",
      image: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      name: "Sarah Williams",
      role: "CTO",
      bio: "Technology architect and full-stack developer",
      image: "https://randomuser.me/api/portraits/women/11.jpg",
    },
    {
      name: "Michael Chen",
      role: "Head of Design",
      bio: "UX/UI specialist focused on conversion optimization",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      bio: "Digital marketing and brand strategy expert",
      image: "https://randomuser.me/api/portraits/women/13.jpg",
    },
  ];

  const guestSpeakers = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Growth strategy expert with 10+ years experience",
      image: "https://randomuser.me/api/portraits/men/20.jpg",
    },
    {
      name: "Sarah Williams",
      role: "CTO",
      bio: "Technology architect and full-stack developer",
      image: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    {
      name: "Michael Chen",
      role: "Head of Design",
      bio: "UX/UI specialist focused on conversion optimization",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      bio: "Digital marketing and brand strategy expert",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
    },
  ];

  return (
    <section className={`pt-10 ${theme === "dark" ? "bg-gray-900/80" : "bg-gray-50"}`}>

      <div className="max-w-7xl mx-auto px-8 mb-20">
  <h2 className={`text-3xl mb-16 text-center ${theme === "dark" ? "text-white" : ""}`}>Meet Our Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-xl overflow-hidden shadow-lg ${
                theme === "dark" ? "bg-gray-900/80" : "bg-[#FDFCF6]"
              }`}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover "
              />
              <div
                className={
                  theme === "dark" ? "text-gray-300 p-6 " : "text-gray-600 p-6 "
                }
              >
                <h3 className="text-xl ">{member.name}</h3>
                <p
                  className={`text-sm mb-3 ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {member.role}
                </p>
                <p
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mb-20">
  <h2 className={`text-3xl mb-16 text-center ${theme === "dark" ? "text-white" : ""}`}>Mentors</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mentors.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-xl overflow-hidden shadow-lg ${
                theme === "dark" ? "bg-gray-900/80" : "bg-[#FDFCF6]"
              }`}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover "
              />
              <div
                className={
                  theme === "dark" ? "text-gray-300 p-6 " : "text-gray-600 p-6 "
                }
              >
                <h3 className="text-xl ">{member.name}</h3>
                <p
                  className={`text-sm mb-3 ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {member.role}
                </p>
                <p
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mb-20">
  <h2 className={`text-3xl mb-16 text-center ${theme === "dark" ? "text-white" : ""}`}>Guest Speakers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {guestSpeakers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-xl overflow-hidden shadow-lg ${
                theme === "dark" ? "bg-gray-900/80" : "bg-[#FDFCF6]"
              }`}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover "
              />
              <div
                className={
                  theme === "dark" ? "text-gray-300 p-6 " : "text-gray-600 p-6 "
                }
              >
                <h3 className="text-xl ">{member.name}</h3>
                <p
                  className={`text-sm mb-3 ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {member.role}
                </p>
                <p
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default Team;
