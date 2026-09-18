# Base image
FROM python:3.14.7-slim

# prevent python from writing pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies as root
RUN apt-get update && \
    apt-get install -y gcc libpq-dev netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Install uv as root into the system path
RUN pip install --no-cache-dir uv==0.11.17

# Create the non-root user
RUN useradd -m -u 1000 dev_user

# Create the working directory and hand it to the user
WORKDIR /server
RUN chown -R dev_user:dev_user /server

# Copy dependency files as root, then chown so the user can read/write them
COPY --chown=dev_user:dev_user pyproject.toml uv.lock ./

# Switch to the non-root user
USER dev_user

# Install project dependencies as the user, so .venv ends up owned by them
RUN uv sync --frozen

# Copy the rest of the source
COPY --chown=dev_user:dev_user . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]