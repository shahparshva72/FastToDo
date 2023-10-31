# Step 1: Build the React application
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy local code to the container
COPY . .

# Build the application
RUN npm run build

# Step 2: Serve the React application using serve
FROM node:18 AS serve

WORKDIR /app

# Copy build files from previous step
COPY --from=build /app/dist ./dist

# Install serve
RUN npm install -g serve

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"]
