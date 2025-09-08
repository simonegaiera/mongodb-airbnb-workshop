FROM gitpod/openvscode-server:1.103.1

USER root

# Set environment variable to avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install basic tools and dependencies
RUN apt-get update -qq && apt-get install -y -qq \
    apt-utils \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update -qq && apt-get install -y -qq \
    curl \
    wget \
    gnupg \
    software-properties-common \
    git \
    less \
    vim \
    net-tools \
    lsof \
    jq \
    unzip \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS version)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y -qq nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB MCP Server globally
RUN npm install -g npm@latest

RUN npm install -g mongodb-mcp-server@latest

# Install Python 3.12 from deadsnakes PPA
RUN apt-get update -qq && apt-get install -y -qq \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update -qq \
    && apt-get install -y -qq \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pip for Python 3.12
RUN wget -O get-pip.py https://bootstrap.pypa.io/get-pip.py \
    && python3.12 get-pip.py \
    && rm get-pip.py

# Set Python 3.12 as default python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

# Install uv (Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && mv $HOME/.local/bin/uv /usr/local/bin/ \
    && mv $HOME/.local/bin/uvx /usr/local/bin/

# Install Java 21 (headless version for smaller footprint)
RUN apt-get update -qq && apt-get install -y -qq \
    openjdk-21-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws/

# Install mongosh
RUN wget -q -P /tmp https://downloads.mongodb.com/compass/mongodb-mongosh_2.5.6_amd64.deb \
    && dpkg -i /tmp/mongodb-mongosh_2.5.6_amd64.deb \
    && apt-get install -f -y -qq \
    && rm -f /tmp/mongodb-mongosh_2.5.6_amd64.deb

USER 1000
