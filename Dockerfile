FROM nixos/nix:latest

# Install git and other essential tools
RUN nix-env -iA nixpkgs.git nixpkgs.bash nixpkgs.coreutils

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install bun
RUN nix-env -iA nixpkgs.bun

# Clone repository with submodules
ARG RAILWAY_GIT_REPO_URL
RUN git clone --recursive $RAILWAY_GIT_REPO_URL .

# Install dependencies and build
RUN bun install
RUN bun run build

# Expose port (adjust if needed)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"] 