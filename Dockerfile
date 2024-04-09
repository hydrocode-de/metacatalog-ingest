FROM python:3.12

# recognize build args for the vite build process
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# update and install packages
RUN apt update && apt upgrade -y && \
    apt install nodejs npm -y && \
    apt install libhdf5-serial-dev -y

# create the structure
RUN mkdir -p /app/backend && mkdir -p /app/frontend
COPY ./backend /app/backend
COPY ./frontend /app/frontend

# install the backend
WORKDIR /app/backend
RUN pip install --upgrade pip && pip install -r requirements.txt

# compile the frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# run
WORKDIR /app/backend
CMD ["python", "server.py"]