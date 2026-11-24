# Luxorides Fleet Portal

A customer booking and fleet operations MVP for Luxorides, a chauffeur-driven luxury car service in Delhi NCR, Mumbai and Bangalore. Customers browse the fleet, get a live itemized quote and book a car. Admins assign chauffeurs and update trip status.

## Tech stack

- **Backend:** Java 17, Spring Boot 3.3, Spring Data JPA, PostgreSQL 16 (in Docker), JUnit 5
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS

## Prerequisites

- Java 17 or newer
- Maven 3.9 or newer
- Node.js 20 or newer
- Docker Desktop (running)

## Run locally (about 5 minutes)

Open three terminals in the repository root.

**1. Database (PostgreSQL in Docker)**

```bash
docker compose up -d
```

**2. Backend** (http://localhost:8080)

```bash
cd backend
mvn spring-boot:run
```

On first start the app creates the tables and seeds 9 vehicles, 6 chauffeurs and 2 demo accounts. Wait for `Started FleetApplication`.

**3. Frontend** (http://localhost:3000)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

To stop the database: `docker compose down` (add `-v` to also delete its data).

## Demo accounts (seeded)

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Customer | customer@luxorides.com   | customer123 |
| Admin    | admin@luxorides.com      | admin123    |

## Try the end-to-end flow

1. Open http://localhost:3000 (the fleet catalog) and use the City and Category dropdowns to filter the vehicles.
2. Click a vehicle. Change the hours and add-ons and watch the itemized price update live.
3. Log in as the customer on that page and book a pickup time.
4. Book the same vehicle again inside the 2-hour turnaround window. You get a clear 409 message saying when the vehicle is free.
5. Open http://localhost:3000/admin, log in as the admin, assign an available chauffeur and change the booking status.

## Run the tests

```bash
cd backend
mvn test
```

5 JUnit 5 unit tests cover the fare calculation and the 2-hour turnaround rule, including the exact boundary (a booking that starts exactly 2 hours after the previous trip ends). They need no database.

## Business rules

**Fare**

```
extra hours = max(0, duration hours - 8)
total = base package price + (extra hours x extra hour rate) + add-ons
```

Example: BMW 7 Series, base 15,000 (8 hrs / 80 km), extra hour 1,800. An 11-hour trip with a Child Seat (500) costs 15,000 + 3 x 1,800 + 500 = 20,900.

**2-hour turnaround**

An existing booking blocks the vehicle from its start until 2 hours after its end. A new trip `[newStart, newEnd]` conflicts when:

```
newStart < existingEnd + 2h   AND   newEnd > existingStart
```

Both comparisons are strict, so a trip starting exactly 2 hours after the previous one ends is allowed. Only bookings with status PENDING, CONFIRMED or IN_PROGRESS block a vehicle. Example: an existing trip 10:00 to 18:00 blocks the vehicle until 20:00. A new trip at 19:59 returns 409; one at 20:00 is accepted.

## API

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/vehicles?city=&category=` | Public | List vehicles, optional filters |
| GET | `/api/vehicles/{id}` | Public | One vehicle |
| GET | `/api/vehicles/{id}/availability` | Public | Blocked time windows (trip end + 2 hours included) |
| POST | `/api/quotes` | Public | Itemized fare for a vehicle, duration and add-ons |
| POST | `/api/auth/login` | Public | Returns a token |
| POST | `/api/bookings` | Logged in | Create a booking (409 if the vehicle is unavailable) |
| GET | `/api/bookings` | Admin | All bookings |
| GET | `/api/chauffeurs/available?bookingId=` | Admin | Chauffeurs available for a booking |
| PUT | `/api/bookings/{id}/chauffeur` | Admin | Assign a chauffeur |
| PATCH | `/api/bookings/{id}/status` | Admin | Update booking status |

Send the token as `Authorization: Bearer <token>`. Status codes: 400 invalid input, 401 missing or invalid token, 403 not an admin, 404 not found, 409 conflict.

## Database

PostgreSQL tables (created by Hibernate from the entities):

- `users`: name, email, password, role (CUSTOMER or ADMIN), token
- `vehicles`: name, category (SEDAN, SUV, ULTRA_LUXURY), city, base package price, extra hour rate
- `chauffeurs`: name, phone number, city, status (AVAILABLE or OFF_DUTY)
- `bookings`: customer, vehicle, chauffeur (empty until assigned), customer name and phone, pickup time, duration, end time, total fare, status
- `booking_add_ons`: booking and add-on, one row per add-on

`end_time` is stored (pickup + duration) so the overlap check is a simple comparison. The total fare is stored so old bookings keep the price the customer saw.

## Project structure

```
backend/   Spring Boot API
  controller/  HTTP endpoints
  service/     business rules (FareCalculator, TurnaroundRule, BookingService)
  repository/  database access
  entity/      tables and enums
  dto/         request and response objects
  config/      seed data, token interceptor, CORS
  exception/   error handling (404, 409, 401, 403, 400)
frontend/  Next.js app
  src/app/         pages: /, /vehicles/[id], /admin
  src/components/  UI components
  src/lib/         typed API client, session handling
  src/types/       TypeScript interfaces
docker-compose.yml  PostgreSQL
```

## Decisions and assumptions

- The brief does not define add-ons, so there is a small fixed list (Child Seat 500, Airport Meet and Greet 1000, Water and Refreshments 300) in the `AddOn` enum.
- Duration is a whole number of hours from 1 to 24. A trip under 8 hours still pays the base package.
- The 2-hour buffer applies after a trip ends, as in the brief.
- Making a booking requires a logged-in user. Assigning a chauffeur and updating status are admin only.
- An available chauffeur is one with status AVAILABLE, in the same city as the vehicle, with no clashing trip (same overlap rule).
- All times are Indian Standard Time. The server sets its default timezone to Asia/Kolkata.
- The server always recalculates the fare when booking and never trusts the price shown in the browser.

## Known limitations

- Demo passwords are stored as plain text and tokens do not expire. A real system would hash passwords and use expiring tokens.
- Two requests for the same vehicle at the exact same moment could both pass the availability check. A real system would lock the vehicle row or add a database constraint.
- Hibernate creates the tables (`ddl-auto=update`). A real system would use migrations.

## Troubleshooting

- **Backend fails with a Hibernate or connection error:** the database is not running. Start Docker Desktop and run `docker compose up -d`.
- **Port 5432 already in use:** stop your local PostgreSQL, or change the port mapping in `docker-compose.yml` and the URL in `backend/src/main/resources/application.properties`.

## Mobile app (optional bonus): chauffeur app

A small React Native (Expo) app where a chauffeur sees their assigned trips and starts or completes them.

**Run it**

1. Start the backend and database as described above.
2. Connect your laptop and phone to the **same Wi-Fi**. Install **Expo Go** on the phone.
3. Find the laptop's Wi-Fi IPv4 address (`ipconfig` on Windows).
4. Open `mobile/src/config.ts` and set `API_URL` to `http://<your-laptop-ip>:8080`.
5. Run:

   ```bash
   cd mobile
   npm install
   npx expo start
   ```

6. Scan the QR code with Expo Go.

**Using it:** choose a chauffeur at the top, and their assigned trips are listed. Tap **Start trip** or **Complete trip** to move the status forward, and pull down to refresh. The change also shows on the `/admin` dashboard.

**Note:** for this demo the app signs in as the seeded admin account, and the chauffeur is picked from a list. There is no separate chauffeur login, because the brief does not require one.