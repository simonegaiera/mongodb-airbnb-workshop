# Define version variables at the top
ARG OPENVSCODE_VERSION=1.105.1

FROM gitpod/openvscode-server:${OPENVSCODE_VERSION}

USER root

# Declare ARG variables after FROM to make them available in build stages
ARG NODE_VERSION=24
ARG NPM_VERSION=11.7.0
ARG PYTHON_VERSION=3.12
ARG JAVA_VERSION=21
ARG MONGODB_MCP_VERSION=1.4.0
ARG MONGOSH_VERSION=2.5.10

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

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y -qq nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB MCP Server globally
RUN npm install -g npm@${NPM_VERSION}

RUN npm install -g mongodb-mcp-server@${MONGODB_MCP_VERSION}

# Install Python from deadsnakes PPA
RUN apt-get update -qq && apt-get install -y -qq \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update -qq \
    && apt-get install -y -qq \
    python${PYTHON_VERSION} \
    python${PYTHON_VERSION}-venv \
    python${PYTHON_VERSION}-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pip for Python
RUN wget -O get-pip.py https://bootstrap.pypa.io/get-pip.py \
    && python${PYTHON_VERSION} get-pip.py \
    && rm get-pip.py

# Set Python as default python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1

# Install uv (Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && mv $HOME/.local/bin/uv /usr/local/bin/ \
    && mv $HOME/.local/bin/uvx /usr/local/bin/

# Install Java (headless version for smaller footprint)
RUN apt-get update -qq && apt-get install -y -qq \
    openjdk-${JAVA_VERSION}-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-${JAVA_VERSION}-openjdk-amd64

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws/

# Install mongosh
RUN wget -q -P /tmp https://downloads.mongodb.com/compass/mongodb-mongosh_${MONGOSH_VERSION}_amd64.deb \
    && dpkg -i /tmp/mongodb-mongosh_${MONGOSH_VERSION}_amd64.deb \
    && apt-get install -f -y -qq \
    && rm -f /tmp/mongodb-mongosh_${MONGOSH_VERSION}_amd64.deb

USER 1000
