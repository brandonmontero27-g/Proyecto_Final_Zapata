const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API - MotoMarket',
    version: '1.0.0',
    description: 'API de MotoMarket, plataforma peruana de compra y venta de motocicletas.'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token devuelto por POST /auth/login (campo "token").'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          status: { type: 'integer' },
          details: { type: 'object', nullable: true }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'comprador@motomarket.pe' },
          password: { type: 'string', minLength: 6, example: 'MiClaveSegura123!' },
          name: { type: 'string', example: 'Ana Quispe' },
          role: { type: 'string', enum: ['buyer', 'seller', 'admin'], example: 'buyer' },
          phone: { type: 'string', nullable: true }
        }
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['buyer', 'seller', 'admin'] }
            }
          }
        }
      },
      CreateMotorcycleRequest: {
        type: 'object',
        required: ['title', 'brand', 'model', 'year', 'displacementCc', 'price', 'location', 'contactPhone'],
        properties: {
          title: { type: 'string', example: 'Honda CB190R 2023' },
          brand: { type: 'string', example: 'Honda' },
          model: { type: 'string', example: 'CB190R' },
          year: { type: 'integer', minimum: 1980, example: 2023 },
          category: { type: 'string', enum: ['scooter', 'naked', 'deportiva', 'enduro', 'cub', 'electrica'], example: 'naked' },
          displacementCc: { type: 'integer', minimum: 0, example: 184 },
          price: { type: 'number', minimum: 0, example: 9500 },
          mileageKm: { type: 'integer', minimum: 0, example: 3200 },
          fuelType: { type: 'string', enum: ['gasolina', 'electrica', 'hibrida'], example: 'gasolina' },
          transmission: { type: 'string', enum: ['manual', 'automatica'], example: 'manual' },
          color: { type: 'string', example: 'Rojo' },
          description: { type: 'string', nullable: true },
          location: { type: 'string', example: 'Lima' },
          address: { type: 'string', nullable: true, example: 'Av. Principal 450' },
          contactPhone: { type: 'string', example: '+51987654321' },
          whatsappPhone: { type: 'string', nullable: true },
          stock: { type: 'integer', minimum: 0, example: 1 },
          condition: { type: 'string', enum: ['new', 'used'], example: 'used' },
          images: { type: 'array', items: { type: 'string', format: 'uri' } }
        }
      },
      Motorcycle: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          seller_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          brand: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          category: { type: 'string', enum: ['scooter', 'naked', 'deportiva', 'enduro', 'cub', 'electrica'] },
          displacement_cc: { type: 'integer' },
          price: { type: 'number' },
          mileage_km: { type: 'integer' },
          fuel_type: { type: 'string', enum: ['gasolina', 'electrica', 'hibrida'] },
          transmission: { type: 'string', enum: ['manual', 'automatica'] },
          color: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          location: { type: 'string' },
          address: { type: 'string', nullable: true },
          contact_phone: { type: 'string' },
          whatsapp_phone: { type: 'string', nullable: true },
          images: { type: 'array', items: { type: 'string' } },
          stock: { type: 'integer' },
          condition: { type: 'string', enum: ['new', 'used'] },
          verified_by_tico: { type: 'boolean' },
          status: { type: 'string', enum: ['pending', 'approved', 'suspended', 'flagged'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Stats: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer' },
          totalMotorcycles: { type: 'integer' },
          pendingDocuments: { type: 'integer' }
        }
      },
      ReviewDocRequest: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: { type: 'string', enum: ['approved', 'rejected'] },
          comentario: { type: 'string', nullable: true }
        }
      },
      MotorcycleStatusRequest: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: { type: 'string', enum: ['approved', 'flagged', 'suspended'] }
        }
      },
      BlockUserRequest: {
        type: 'object',
        required: ['motivo'],
        properties: {
          motivo: { type: 'string', example: 'Publicaciones fraudulentas' },
          dias: { type: 'integer', minimum: 1, nullable: true, example: 7 }
        }
      },
      UploadImagesRequest: {
        type: 'object',
        required: ['images'],
        properties: {
          images: {
            type: 'array',
            minItems: 1,
            maxItems: 8,
            items: { type: 'string', description: 'Data URL base64 (data:image/png;base64,...) o base64 plano' },
            example: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=']
          }
        }
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' }
        },
        description: 'Al menos un campo es obligatorio.'
      },
      UpdatePasswordRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 6, example: 'MiNuevaClave123!' }
        }
      },
      UpdateAvatarRequest: {
        type: 'object',
        required: ['image'],
        properties: {
          image: { type: 'string', description: 'Data URL base64 (data:image/png;base64,...) o base64 plano' }
        }
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['buyer', 'seller', 'admin'] },
          phone: { type: 'string', nullable: true },
          avatar_url: { type: 'string', nullable: true },
          is_verified: { type: 'boolean' }
        }
      },
      BuyerStats: {
        type: 'object',
        properties: {
          savedFavorites: { type: 'integer' },
          activeChats: { type: 'integer' }
        }
      },
      SellerStats: {
        type: 'object',
        properties: {
          totalMotorcycles: { type: 'integer' },
          motorcyclesByStatus: { type: 'object', additionalProperties: { type: 'integer' }, example: { approved: 3, pending: 1 } },
          favoritesReceived: { type: 'integer' },
          contactsReceived: { type: 'integer' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          recipient_id: { type: 'string', format: 'uuid' },
          actor_id: { type: 'string', format: 'uuid', nullable: true },
          type: {
            type: 'string',
            enum: ['motorcycle_approved', 'motorcycle_flagged', 'motorcycle_suspended', 'motorcycle_pending_review']
          },
          title: { type: 'string' },
          body: { type: 'string', nullable: true },
          motorcycle_id: { type: 'string', format: 'uuid', nullable: true },
          read_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      NotificationsResponse: {
        type: 'object',
        properties: {
          notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
          unreadCount: { type: 'integer' }
        }
      },
      StartChatRequest: {
        type: 'object',
        required: ['sellerId', 'motorcycleId'],
        properties: {
          sellerId: { type: 'string', format: 'uuid' },
          motorcycleId: { type: 'string', format: 'uuid' }
        }
      },
      SendMessageRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', minLength: 1, maxLength: 4000, example: '¿Sigue disponible la moto?' }
        }
      },
      Chat: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          buyer_id: { type: 'string', format: 'uuid' },
          seller_id: { type: 'string', format: 'uuid' },
          motorcycle_id: { type: 'string', format: 'uuid', nullable: true },
          last_message: { type: 'string', nullable: true },
          unread: { type: 'boolean' },
          status: { type: 'string', enum: ['online', 'offline'] }
        }
      },
      ChatMessage: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          chat_id: { type: 'string', format: 'uuid' },
          sender: { type: 'string', enum: ['buyer', 'seller'] },
          text: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Solicitud inválida (validación fallida)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      Unauthorized: {
        description: 'No autenticado (falta o es inválido el token Bearer)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      Forbidden: {
        description: 'Autenticado pero sin el rol requerido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Registrar usuario',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } }
          },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Iniciar sesion',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/motorcycles': {
      get: {
        summary: 'Listar motos aprobadas (catalogo)',
        tags: ['Motorcycles'],
        parameters: [
          { name: 'marca', in: 'query', schema: { type: 'string' }, example: 'Honda' },
          { name: 'categoria', in: 'query', schema: { type: 'string', enum: ['scooter', 'naked', 'deportiva', 'enduro', 'cub', 'electrica'] } },
          { name: 'precio_max', in: 'query', schema: { type: 'number' }, description: 'Precio maximo en soles' },
          { name: 'anio', in: 'query', schema: { type: 'integer' } },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['new', 'used'] }, description: 'Nueva o usada' },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Lista de motos con status = approved',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Motorcycle' } } }
            }
          }
        }
      },
      post: {
        summary: 'Publicar una moto (vendedor/admin)',
        tags: ['Motorcycles'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMotorcycleRequest' } } }
        },
        responses: {
          201: {
            description: 'Moto creada con status = pending',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Motorcycle' } } }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/motorcycles/{id}': {
      get: {
        summary: 'Detalle de una moto, incluye motos relacionadas',
        tags: ['Motorcycles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Moto con campo adicional "related" (hasta 4 motos similares)' },
          404: { description: 'La moto no existe' }
        }
      }
    },
    '/motorcycles/{id}/imagenes': {
      post: {
        summary: 'Subir fotos de una publicacion a Supabase Storage (dueño o admin)',
        tags: ['Motorcycles'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadImagesRequest' } } }
        },
        responses: {
          200: {
            description: 'Publicacion actualizada con las nuevas URLs de imagen',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Motorcycle' } } }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'La publicacion no existe' }
        }
      }
    },
    '/perfil': {
      get: {
        summary: 'Obtener mi propio perfil',
        tags: ['Perfil'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Perfil actual, envuelto en { profile }', content: { 'application/json': { schema: { type: 'object', properties: { profile: { $ref: '#/components/schemas/Profile' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      patch: {
        summary: 'Actualizar nombre/telefono de mi propio perfil',
        tags: ['Perfil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } }
        },
        responses: {
          200: { description: 'Perfil actualizado, envuelto en { profile }', content: { 'application/json': { schema: { type: 'object', properties: { profile: { $ref: '#/components/schemas/Profile' } } } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/perfil/password': {
      patch: {
        summary: 'Cambiar mi propia contraseña',
        tags: ['Perfil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePasswordRequest' } } }
        },
        responses: {
          200: { description: 'Contraseña actualizada' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/perfil/avatar': {
      post: {
        summary: 'Subir/cambiar mi foto de perfil',
        tags: ['Perfil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAvatarRequest' } } }
        },
        responses: {
          200: { description: 'Perfil actualizado con la nueva avatar_url, envuelto en { profile }', content: { 'application/json': { schema: { type: 'object', properties: { profile: { $ref: '#/components/schemas/Profile' } } } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/stats/comprador': {
      get: {
        summary: 'KPIs del comprador autenticado (favoritos, chats activos)',
        tags: ['Stats'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Conteos del comprador', content: { 'application/json': { schema: { $ref: '#/components/schemas/BuyerStats' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/stats/vendedor': {
      get: {
        summary: 'KPIs del vendedor autenticado (motos por estado, favoritos y contactos recibidos)',
        tags: ['Stats'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Conteos del vendedor', content: { 'application/json': { schema: { $ref: '#/components/schemas/SellerStats' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/notificaciones': {
      get: {
        summary: 'Listar mis notificaciones (mas recientes primero, maximo 50) y el conteo de no leidas',
        tags: ['Notificaciones'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notificaciones y conteo de no leidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationsResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/notificaciones/{id}/leer': {
      put: {
        summary: 'Marcar una notificacion propia como leida',
        tags: ['Notificaciones'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Notificacion actualizada, envuelta en { notification }' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'La notificacion no existe o no te pertenece' }
        }
      }
    },
    '/notificaciones/leer-todas': {
      put: {
        summary: 'Marcar todas mis notificaciones como leidas',
        tags: ['Notificaciones'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notificaciones marcadas como leidas' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/chats': {
      post: {
        summary: 'Iniciar (o reutilizar) un chat con un vendedor sobre una moto (solo compradores)',
        tags: ['Chats'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StartChatRequest' } } }
        },
        responses: {
          201: { description: 'Chat creado o existente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Chat' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      },
      get: {
        summary: 'Listar mis chats (como comprador o como vendedor)',
        tags: ['Chats'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de chats',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Chat' } } } }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/chats/{id}/messages': {
      get: {
        summary: 'Listar los mensajes de un chat (solo participantes)',
        tags: ['Chats'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Mensajes ordenados por fecha',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ChatMessage' } } } }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'No participas en este chat' },
          404: { description: 'El chat no existe' }
        }
      },
      post: {
        summary: 'Enviar un mensaje en un chat (solo participantes)',
        tags: ['Chats'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SendMessageRequest' } } }
        },
        responses: {
          201: { description: 'Mensaje enviado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChatMessage' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'No participas en este chat' },
          404: { description: 'El chat no existe' }
        }
      }
    },
    '/admin/stats': {
      get: {
        summary: 'Estadisticas del panel (admin)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Conteos generales', content: { 'application/json': { schema: { $ref: '#/components/schemas/Stats' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/admin/documentos/pendientes': {
      get: {
        summary: 'Documentos pendientes de verificacion (admin)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de documentos con status = pending' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/admin/documentos/{id}': {
      put: {
        summary: 'Aprobar o rechazar un documento (admin)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewDocRequest' } } }
        },
        responses: {
          200: { description: 'Documento actualizado, envuelto en { documento }' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/admin/motos/pendientes': {
      get: {
        summary: 'Listar motos pendientes de aprobacion (admin)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de motos con status = pending',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Motorcycle' } } }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/admin/motos/{id}/estado': {
      put: {
        summary: 'Aprobar, observar o suspender una moto (admin)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MotorcycleStatusRequest' } } }
        },
        responses: {
          200: { description: 'Moto actualizada, envuelta en { moto }' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/admin/usuarios/{id}/bloquear': {
      put: {
        summary: 'Bloquear a un usuario (admin)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BlockUserRequest' } } }
        },
        responses: {
          200: { description: 'Usuario bloqueado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    }
  }
};

export default swaggerSpec;
