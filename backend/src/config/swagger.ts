import swaggerJsdoc from 'swagger-jsdoc';

/**
 * OpenAPI 3.0 spec. Reusable schemas live under `components.schemas`.
 * Route handlers reference these by name from their `@openapi` JSDoc blocks.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SAI Physiotherapy API',
      version: '1.0.0',
      description: [
        'Enterprise REST API for **SAI Physiotherapy Spine Care & Paralysis Centre** in Ahmedabad, Gujarat.',
        '',
        'All responses follow the envelope `{ success, data?, message?, error?, pagination? }`.',
        '',
        'Authentication uses **JWT bearer tokens** issued via `/auth/login`. Access tokens last',
        '15 minutes; refresh tokens last 7 days and are exchanged at `/auth/refresh-token`.',
        '',
        'File uploads go through `/upload/*` and are persisted to **Cloudflare R2** when configured,',
        'with automatic fallback to the local `backend/uploads/{module}/yyyy/mm/` directory.',
      ].join('\n'),
      contact: { name: 'SAI Physiotherapy', email: 'clinic@saiphysiotherapy.com' },
      license: { name: 'Proprietary' },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development' },
      { url: 'https://api.saiphysiotherapy.com/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter: Bearer <access_token>',
        },
      },
      schemas: {
        // ── Envelopes ──────────────────────────────────────────────────────
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { description: 'Resource-specific payload' },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed: name is required' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 137 },
            totalPages: { type: 'integer', example: 7 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },

        // ── Auth ───────────────────────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@saiphysio.com' },
            password: { type: 'string', minLength: 8, example: 'Admin@123456' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR…' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR…' },
            user: { $ref: '#/components/schemas/AuthUser' },
          },
        },
        AuthUser: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Dr. Rajesh Patel' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'],
            },
            avatar: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            specialization: { type: 'string', nullable: true },
            qualification: { type: 'string', nullable: true },
            experience: { type: 'number', nullable: true },
            bio: { type: 'string', nullable: true },
          },
        },

        // ── Storage block (reused by every model with an image) ───────────
        StoredImage: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', example: 'https://cdn.saiphysio.com/doctors/2026/05/abc.png' },
            storageKey: { type: 'string', example: 'doctors/2026/05/abc.png' },
            storageProvider: { type: 'string', enum: ['r2', 'local'], example: 'r2' },
            mimetype: { type: 'string', example: 'image/png' },
          },
        },
        UploadedFile: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            key: { type: 'string' },
            storage: { type: 'string', enum: ['r2', 'local'] },
            mimetype: { type: 'string' },
            size: { type: 'integer' },
            originalName: { type: 'string' },
          },
        },

        // ── Domain models ─────────────────────────────────────────────────
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Back Pain Treatment' },
            slug: { type: 'string', example: 'back-pain-treatment' },
            category: { type: 'string' },
            shortDescription: { type: 'string' },
            longDescription: { type: 'string' },
            price: {
              type: 'object',
              properties: {
                from: { type: 'number', example: 500 },
                to: { type: 'number', example: 2000 },
              },
            },
            duration: { type: 'string', example: '30-45 minutes' },
            bannerImage: { type: 'string' },
            bannerStorageKey: { type: 'string' },
            bannerStorageProvider: { type: 'string', enum: ['r2', 'local'] },
            images: { type: 'array', items: { type: 'string' } },
            benefits: { type: 'array', items: { type: 'string' } },
            treatmentProcess: { type: 'array', items: { type: 'string' } },
            faqs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                },
              },
            },
            isActive: { type: 'boolean' },
            order: { type: 'integer' },
            seo: { $ref: '#/components/schemas/Seo' },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Dr. Rajesh Patel' },
            slug: { type: 'string', example: 'dr-rajesh-patel' },
            designation: { type: 'string' },
            specialties: { type: 'array', items: { type: 'string' } },
            shortBio: { type: 'string' },
            bio: { type: 'string' },
            photo: { $ref: '#/components/schemas/StoredImage' },
            qualifications: { type: 'array', items: { type: 'string' } },
            credentials: { type: 'array', items: { type: 'string' } },
            languages: { type: 'array', items: { type: 'string' } },
            experienceYears: { type: 'integer', example: 15 },
            registrationNumber: { type: 'string' },
            consultationFee: { type: 'number' },
            availability: {
              type: 'object',
              properties: {
                days: {
                  type: 'array',
                  items: { type: 'string', enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
                },
                timeStart: { type: 'string', example: '09:00' },
                timeEnd: { type: 'string', example: '20:00' },
                sessionDurationMins: { type: 'integer', example: 30 },
                notes: { type: 'string' },
              },
            },
            socials: {
              type: 'object',
              properties: {
                linkedin: { type: 'string' },
                instagram: { type: 'string' },
                facebook: { type: 'string' },
              },
            },
            userId: { type: 'string', nullable: true },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            seo: { $ref: '#/components/schemas/Seo' },
          },
        },
        GalleryItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            caption: { type: 'string' },
            category: { type: 'string', enum: ['clinic', 'treatments', 'events', 'awards', 'team'] },
            image: { $ref: '#/components/schemas/StoredImage' },
            alt: { type: 'string' },
            order: { type: 'integer' },
            isPublished: { type: 'boolean' },
          },
        },
        Blog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string', maxLength: 500 },
            content: { type: 'string', description: 'HTML body' },
            featuredImage: { type: 'string' },
            featuredStorageKey: { type: 'string' },
            featuredStorageProvider: { type: 'string', enum: ['r2', 'local'] },
            author: { type: 'string', description: 'User _id' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            publishedAt: { type: 'string', format: 'date-time' },
            views: { type: 'integer' },
            seo: { $ref: '#/components/schemas/Seo' },
          },
        },
        Testimonial: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientName: { type: 'string' },
            patientAge: { type: 'integer' },
            condition: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            review: { type: 'string', minLength: 10 },
            videoUrl: { type: 'string', nullable: true },
            beforeAfterImages: {
              type: 'object',
              properties: { before: { type: 'string' }, after: { type: 'string' } },
            },
            isApproved: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            source: { type: 'string', enum: ['manual', 'google', 'website_form'] },
          },
        },
        CmsPage: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string', description: 'HTML body' },
            showInFooter: { type: 'boolean' },
            footerLabel: { type: 'string' },
            footerOrder: { type: 'integer' },
            isPublished: { type: 'boolean' },
            publishedAt: { type: 'string', format: 'date-time' },
            seo: { $ref: '#/components/schemas/Seo' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { type: 'string', example: 'SAI-2026-0001' },
            personalInfo: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dob: { type: 'string', format: 'date' },
                gender: { type: 'string', enum: ['male', 'female', 'other'] },
                phone: { type: 'string' },
                email: { type: 'string', format: 'email' },
                address: { type: 'string' },
                city: { type: 'string' },
                bloodGroup: { type: 'string' },
                emergencyContact: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    relation: { type: 'string' },
                  },
                },
              },
            },
            medicalHistory: {
              type: 'object',
              properties: {
                chiefComplaint: { type: 'string' },
                pastHistory: { type: 'string' },
                surgicalHistory: { type: 'string' },
                medications: { type: 'array', items: { type: 'string' } },
                allergies: { type: 'array', items: { type: 'string' } },
                comorbidities: { type: 'array', items: { type: 'string' } },
              },
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['mri', 'xray', 'report', 'prescription', 'other'] },
                  url: { type: 'string' },
                  storageKey: { type: 'string' },
                  storageProvider: { type: 'string', enum: ['r2', 'local'] },
                  mimetype: { type: 'string' },
                  size: { type: 'integer' },
                  uploadedAt: { type: 'string', format: 'date-time' },
                  uploadedBy: { type: 'string' },
                },
              },
            },
            assignedDoctor: { type: 'string' },
            status: { type: 'string', enum: ['active', 'discharged', 'followup'] },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            appointmentId: { type: 'string', example: 'APT-2026-00001' },
            patient: { type: 'string', description: 'Patient _id' },
            doctor: { type: 'string', description: 'User _id (doctor)' },
            service: { type: 'string', description: 'Service _id' },
            scheduledAt: { type: 'string', format: 'date-time' },
            duration: { type: 'integer', example: 45 },
            status: {
              type: 'string',
              enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
            },
            type: { type: 'string', enum: ['new', 'followup', 'emergency'] },
            tokenNumber: { type: 'integer' },
            notes: { type: 'string' },
            cancelReason: { type: 'string' },
            reminders: {
              type: 'object',
              properties: {
                sms: { type: 'boolean' },
                email: { type: 'boolean' },
                whatsapp: { type: 'boolean' },
              },
            },
            bookedBy: { type: 'string' },
          },
        },
        TreatmentSession: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patient: { type: 'string' },
            appointment: { type: 'string' },
            doctor: { type: 'string' },
            sessionNumber: { type: 'integer' },
            date: { type: 'string', format: 'date-time' },
            chiefComplaint: { type: 'string' },
            soapNotes: {
              type: 'object',
              properties: {
                subjective: { type: 'string' },
                objective: { type: 'string' },
                assessment: { type: 'string' },
                plan: { type: 'string' },
              },
            },
            vitalSigns: {
              type: 'object',
              properties: {
                bp: { type: 'string' },
                pulse: { type: 'number' },
                temperature: { type: 'number' },
                spo2: { type: 'number' },
                painScale: { type: 'number', minimum: 0, maximum: 10 },
              },
            },
            treatmentsGiven: { type: 'array', items: { type: 'string' } },
            exercisesPrescribed: { type: 'array', items: { type: 'string' } },
            recoveryPercentage: { type: 'number', minimum: 0, maximum: 100 },
            nextSessionDate: { type: 'string', format: 'date-time' },
            attachments: { type: 'array', items: { type: 'string' } },
          },
        },
        Billing: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string', example: 'INV-2026-00001' },
            patient: { type: 'string' },
            appointment: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  quantity: { type: 'integer' },
                  unitPrice: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
            subtotal: { type: 'number' },
            discount: { type: 'number' },
            discountType: { type: 'string', enum: ['flat', 'percentage'] },
            tax: { type: 'number' },
            totalAmount: { type: 'number' },
            amountPaid: { type: 'number' },
            balanceDue: { type: 'number' },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'upi_manual', 'bank_transfer', 'cheque', 'pending'],
            },
            paymentStatus: { type: 'string', enum: ['paid', 'partial', 'pending', 'waived'] },
            paymentDate: { type: 'string', format: 'date-time' },
            receivedBy: { type: 'string' },
            notes: { type: 'string' },
            createdBy: { type: 'string' },
          },
        },
        Seo: {
          type: 'object',
          properties: {
            metaTitle: { type: 'string' },
            metaDescription: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
            ogImage: { type: 'string' },
            canonicalUrl: { type: 'string' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid bearer token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        Forbidden: {
          description: 'Authenticated but lacks required role',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        ValidationError: {
          description: 'Request body or query parameters failed validation',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Login, refresh, registration, password reset' },
      { name: 'Patients', description: 'Patient records, medical history, documents' },
      { name: 'Appointments', description: 'Booking, status transitions, slot availability' },
      { name: 'Sessions', description: 'Treatment sessions, SOAP notes, recovery tracking' },
      { name: 'Billing', description: 'Invoices, payments, daily/monthly reports' },
      { name: 'Services', description: 'Clinic-treatment services catalog (public + admin)' },
      { name: 'Doctors', description: 'Doctor profiles for the public website' },
      { name: 'Blog', description: 'Health articles (public + admin)' },
      { name: 'Testimonials', description: 'Patient reviews + moderation queue' },
      { name: 'Gallery', description: 'Clinic photo gallery, grouped by category' },
      { name: 'Pages', description: 'Admin-authored CMS pages (privacy/terms/etc.)' },
      { name: 'Settings', description: 'Single-document clinic settings + homepage' },
      { name: 'Analytics', description: 'Dashboard KPIs, trends, reports' },
      { name: 'Upload', description: 'Multipart file uploads (R2 + local fallback)' },
    ],
  },
  apis: ['./src/routes/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
