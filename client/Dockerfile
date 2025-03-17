FROM node:23-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_SERVER_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_POSTS_PER_PAGE

ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_POSTS_PER_PAGE=$VITE_POSTS_PER_PAGE

RUN pnpm build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]