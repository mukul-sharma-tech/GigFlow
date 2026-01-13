# GigFlow

GigFlow is a comprehensive gig economy platform that connects freelancers with clients, enabling seamless collaboration on projects. Built with modern web technologies, it provides a secure and efficient way to post gigs, submit proposals, manage contracts, and communicate in real-time.

## Features

### Core Functionality
- **User Authentication**: Secure signup, login, email verification, and password reset
- **Role-Based Access**: Separate interfaces for clients and freelancers
- **Gig Posting**: Clients can create and publish gig opportunities
- **Proposal System**: Freelancers can submit detailed proposals for gigs
- **Contract Management**: Automated contract creation and approval workflow
- **Real-Time Chat**: Integrated messaging system for project communication
- **Escrow System**: Secure payment handling with escrow protection
- **Dashboard**: Personalized dashboards for tracking gigs, contracts, and earnings

### Additional Features
- **Profile Management**: Comprehensive profiles for both clients and freelancers
- **Gig Marketplace**: Browse and search available gigs
- **Order Tracking**: Monitor completed and ongoing projects
- **Notifications**: Real-time notifications for new messages and updates
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Framer Motion animations
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT sessions
- **Real-Time Communication**: Socket.io
- **Email Service**: Nodemailer for transactional emails
- **Icons**: Lucide React

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 18 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- An email service provider (Gmail, SendGrid, etc.) for sending emails

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd gigflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/GigFlow

   # NextAuth
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com

   # Server Configuration (optional)
   HOSTNAME=localhost
   PORT=3000
   ```

4. **Start MongoDB**:
   Ensure MongoDB is running on your system or update `MONGO_URI` to point to your MongoDB instance.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to access the application.

## Usage

### For Clients:
1. Sign up and verify your email
2. Complete your client profile
3. Post a gig with detailed requirements
4. Review freelancer proposals
5. Select and approve a proposal to create a contract
6. Communicate via chat and manage project delivery

### For Freelancers:
1. Sign up and verify your email
2. Complete your freelancer profile
3. Browse available gigs in the marketplace
4. Submit proposals with your bid and portfolio
5. Once selected, work on the contract
6. Deliver work and communicate with the client

### General Navigation:
- **Dashboard**: Overview of your gigs, contracts, and activity
- **Marketplace**: Browse and search for gigs
- **Contracts**: Manage ongoing and completed projects
- **Chats**: Real-time messaging with collaborators
- **Profile**: Update your personal and professional information

## Project Structure

```
gigflow/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── gigs/              # Gig-related pages
│   ├── login/             # Authentication pages
│   └── ...
├── components/            # Reusable React components
├── lib/                   # Utility libraries
├── models/                # MongoDB schemas
├── public/                # Static assets
├── socket-server/         # Socket.io server logic
└── types/                 # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
