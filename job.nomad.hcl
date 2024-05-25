job "dfunkt" {
  namespace = "auth"

  type = "service"

  group "dfunkt" {
    network {
      port "http" { }
    }

    service {
      name     = "dfunkt"
      port     = "http"
      provider = "nomad"
      tags = [
        "traefik-external.enable=true",
        "traefik-external.http.routers.dfunkt.rule=Host(`dfunkt.datasektionen.se`)",
        "traefik-external.http.routers.dfunkt.entrypoints=websecure",
        "traefik-external.http.routers.dfunkt.tls.certresolver=default",
      ]
    }

    task "dfunkt" {
      driver = "docker"

      config {
        image = var.image_tag
        ports = ["http"]
      }

      template {
        data        = <<ENV
PORT={{ env "NOMAD_PORT_http" }}
{{ with nomadVar "nomad/jobs/dfunkt" }}
SESSION_SECRET={{ .session_secret }}
DATABASE_URL=postgres://dfunkt:{{ .database_password }}@postgres.dsekt.internal:5432/dfunkt
LOGIN_KEY={{ .login_api_key }}
{{ end }}
NODE_ENV=production
PLS_URL=https://pls.datasektionen.se
LOGIN_API_URL=https://login.datasektionen.se
LOGIN_FRONTEND_URL=https://login.datasektionen.se
ENV
        destination = "local/.env"
        env         = true
      }
    }
  }
}

variable "image_tag" {
  type = string
  default = "ghcr.io/datasektionen/dfunkt:latest"
}
