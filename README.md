# Home Run with Pipita - Frontend

Modern, responsive ticketing platform frontend built with React, Vite, and TailwindCSS.

## Features

- **Event Discovery**: Browse and search upcoming events
- **Ticket Selection**: Interactive tier-based ticket selection with real-time availability
- **Time-Bound Sales**: Visual indicators for Flash Sales, Die Hard tickets, and sale status
- **Group Tickets**: Support for purchasing bundle tickets (e.g., tables)
- **Adopt-a-Ticket**: Charitable ticket gifting interface with lottery stats
- **Secure Checkout**: Multi-provider payment integration (M-Pesa & Stripe)
- **Ticket Management**: View tickets with QR codes for entry
- **Responsive Design**: Mobile-first, works on all devices
- **Authentication**: JWT-based user authentication

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4
- **Routing**: React Router v7
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running backend API (see backend/README.md)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── App.jsx                 # Main app component with routing
├── main.jsx               # Entry point
├── context/
│   └── AuthContext.jsx    # Authentication context
├── services/
│   └── api.js             # API service layer
└── pages/
    ├── Events.jsx         # Event listing
    ├── EventDetails.jsx   # Event details & ticket selection
    ├── Checkout.jsx       # Checkout & payment
    ├── MyTickets.jsx      # User tickets with QR codes
    ├── Login.jsx          # Login page
    └── Register.jsx       # Registration page
```

## Key Features

### Ticket Selection
- Tiers grouped by category (REGULAR, VIP, VVIP, STUDENT)
- Real-time availability updates
- Sale status indicators (Coming Soon, Active, Sold Out)
- Time-bound sales display (Flash Sales, Die Hard)
- Adopt-a-Ticket option for lottery-enabled events

### Checkout Flow
1. Review order summary
2. Select payment method (M-Pesa or Stripe)
3. For M-Pesa: Enter phone number for STK Push
4. For Stripe: Redirect to Stripe Checkout
5. Real-time payment status updates
6. Auto-redirect to tickets on success

### My Tickets
- View all purchased tickets
- QR code generation and display
- Download QR code as image
- Lottery ticket indicators

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

## License

Proprietary - VDM Digital Agency
