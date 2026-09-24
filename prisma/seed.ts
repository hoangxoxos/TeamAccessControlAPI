import "dotenv/config";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../src/common/config/prisma.js";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const now = new Date();
const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

// Stable IDs: makes seed data reproducible.
const ids = {
  users: {
    owner: "10000000-0000-4000-8000-000000000001",
    admin: "10000000-0000-4000-8000-000000000002",
    member: "10000000-0000-4000-8000-000000000003",
    viewer: "10000000-0000-4000-8000-000000000004",
  },
  orgs: {
    acme: "20000000-0000-4000-8000-000000000001",
    beta: "20000000-0000-4000-8000-000000000002",
  },
  teams: {
    engineering: "30000000-0000-4000-8000-000000000001",
    marketing: "30000000-0000-4000-8000-000000000002",
    betaDev: "30000000-0000-4000-8000-000000000003",
  },
  sessions: {
    owner: "40000000-0000-4000-8000-000000000001",
    admin: "40000000-0000-4000-8000-000000000002",
  },
  projects: {
    api: "50000000-0000-4000-8000-000000000001",
    dashboard: "50000000-0000-4000-8000-000000000002",
    betaApp: "50000000-0000-4000-8000-000000000003",
  },
  invitations: {
    pending: "60000000-0000-4000-8000-000000000001",
    accepted: "60000000-0000-4000-8000-000000000002",
  },
  auditLogs: {
    login: "70000000-0000-4000-8000-000000000001",
    invite: "70000000-0000-4000-8000-000000000002",
    role: "70000000-0000-4000-8000-000000000003",
  },
};

// These tokens are for local development only.
// Never use these predictable values in production.
const rawRefreshToken = "seed-refresh-token-owner";
const rawAdminRefreshToken = "seed-refresh-token-admin";
const rawInviteToken = "seed-invite-token-pending";
const rawAcceptedInviteToken = "seed-invite-token-accepted";

async function main() {
  console.log("Starting database seed...");

  // --------------------------------------------------
  // 1. USERS
  // --------------------------------------------------

  const passwordHash = await bcrypt.hash("123456", 12);

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {
      name: "Alice Owner",
      passwordHash,
      isActive: true,
    },
    create: {
      id: ids.users.owner,
      email: "owner@example.com",
      passwordHash,
      name: "Alice Owner",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Bob Admin",
      passwordHash,
      isActive: true,
    },
    create: {
      id: ids.users.admin,
      email: "admin@example.com",
      passwordHash,
      name: "Bob Admin",
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {
      name: "Charlie Member",
      passwordHash,
      isActive: true,
    },
    create: {
      id: ids.users.member,
      email: "member@example.com",
      passwordHash,
      name: "Charlie Member",
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {
      name: "Diana Viewer",
      passwordHash,
      isActive: true,
    },
    create: {
      id: ids.users.viewer,
      email: "viewer@example.com",
      passwordHash,
      name: "Diana Viewer",
    },
  });

  // --------------------------------------------------
  // 2. ORGANIZATIONS
  // --------------------------------------------------

  const acme = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: { name: "Acme Corporation" },
    create: {
      id: ids.orgs.acme,
      name: "Acme Corporation",
      slug: "acme",
    },
  });

  const betaOrg = await prisma.organization.upsert({
    where: { slug: "beta-tech" },
    update: { name: "Beta Technologies" },
    create: {
      id: ids.orgs.beta,
      name: "Beta Technologies",
      slug: "beta-tech",
    },
  });

  // --------------------------------------------------
  // 3. TEAMS
  // --------------------------------------------------

  const engineering = await prisma.team.upsert({
    where: {
      organizationId_name: {
        organizationId: acme.id,
        name: "Engineering",
      },
    },
    update: {},
    create: {
      id: ids.teams.engineering,
      name: "Engineering",
      organizationId: acme.id,
    },
  });

  const marketing = await prisma.team.upsert({
    where: {
      organizationId_name: {
        organizationId: acme.id,
        name: "Marketing",
      },
    },
    update: {},
    create: {
      id: ids.teams.marketing,
      name: "Marketing",
      organizationId: acme.id,
    },
  });

  const betaDev = await prisma.team.upsert({
    where: {
      organizationId_name: {
        organizationId: betaOrg.id,
        name: "Development",
      },
    },
    update: {},
    create: {
      id: ids.teams.betaDev,
      name: "Development",
      organizationId: betaOrg.id,
    },
  });

  // --------------------------------------------------
  // 4. ROLES
  // --------------------------------------------------

  const roleDefinitions = [
    {
      name: "owner",
      description: "Full control over the team",
    },
    {
      name: "admin",
      description: "Manage team members and resources",
    },
    {
      name: "member",
      description: "Create and modify assigned resources",
    },
    {
      name: "viewer",
      description: "Read-only access to resources",
    },
  ];

  const roles: Record<string, { id: string; name: string }> = {};

  for (const roleData of roleDefinitions) {
    roles[roleData.name] = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
  }

  // --------------------------------------------------
  // 5. PERMISSIONS
  // --------------------------------------------------

  const permissionDefinitions = [
    ["users.read", "View team members"],
    ["users.invite", "Invite users to the team"],
    ["users.update", "Update team member information"],
    ["users.delete", "Remove members from the team"],
    ["projects.read", "View projects"],
    ["projects.write", "Create and update projects"],
    ["projects.delete", "Delete projects"],
    ["billing.read", "View billing information"],
    ["billing.write", "Manage billing information"],
    ["roles.manage", "Manage team roles and permissions"],
  ] as const;

  const permissions: Record<string, { id: string; key: string }> = {};

  for (const [key, description] of permissionDefinitions) {
    permissions[key] = await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
  }

  // --------------------------------------------------
  // 6. ROLE PERMISSIONS (RBAC)
  // --------------------------------------------------

  const rolePermissionMap: Record<string, string[]> = {
    owner: permissionDefinitions.map(([key]) => key),

    admin: [
      "users.read",
      "users.invite",
      "users.update",
      "users.delete",
      "projects.read",
      "projects.write",
      "projects.delete",
      "billing.read",
      "roles.manage",
    ],

    member: ["users.read", "projects.read", "projects.write"],

    viewer: ["users.read", "projects.read"],
  };

  for (const [roleName, permissionKeys] of Object.entries(rolePermissionMap)) {
    for (const permissionKey of permissionKeys) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roles[roleName].id,
            permissionId: permissions[permissionKey].id,
          },
        },
        update: {},
        create: {
          roleId: roles[roleName].id,
          permissionId: permissions[permissionKey].id,
        },
      });
    }
  }

  // --------------------------------------------------
  // 7. MEMBERSHIPS
  // --------------------------------------------------

  const membershipDefinitions = [
    {
      userId: owner.id,
      teamId: engineering.id,
      roleId: roles.owner.id,
    },
    {
      userId: admin.id,
      teamId: engineering.id,
      roleId: roles.admin.id,
    },
    {
      userId: member.id,
      teamId: engineering.id,
      roleId: roles.member.id,
    },
    {
      userId: viewer.id,
      teamId: engineering.id,
      roleId: roles.viewer.id,
    },

    // Same user can have a different role in another team.
    {
      userId: member.id,
      teamId: marketing.id,
      roleId: roles.admin.id,
    },
    {
      userId: owner.id,
      teamId: betaDev.id,
      roleId: roles.owner.id,
    },
  ];

  for (const membership of membershipDefinitions) {
    await prisma.membership.upsert({
      where: {
        userId_teamId: {
          userId: membership.userId,
          teamId: membership.teamId,
        },
      },
      update: {
        roleId: membership.roleId,
      },
      create: membership,
    });
  }

  // --------------------------------------------------
  // 8. SESSIONS
  // --------------------------------------------------

  await prisma.session.upsert({
    where: {
      refreshTokenHash: hashToken(rawRefreshToken),
    },
    update: {
      isRevoked: false,
      expiresAt,
    },
    create: {
      id: ids.sessions.owner,
      userId: owner.id,
      refreshTokenHash: hashToken(rawRefreshToken),
      userAgent: "Mozilla/5.0",
      ipAddress: "127.0.0.1",
      isRevoked: false,
      expiresAt,
    },
  });

  await prisma.session.upsert({
    where: {
      refreshTokenHash: hashToken(rawAdminRefreshToken),
    },
    update: {
      isRevoked: false,
      expiresAt,
    },
    create: {
      id: ids.sessions.admin,
      userId: admin.id,
      refreshTokenHash: hashToken(rawAdminRefreshToken),
      userAgent: "Mozilla/5.0",
      ipAddress: "127.0.0.1",
      isRevoked: false,
      expiresAt,
    },
  });

  // --------------------------------------------------
  // 9. PROJECTS
  // --------------------------------------------------

  const projectDefinitions = [
    {
      id: ids.projects.api,
      name: "Sangam API",
      teamId: engineering.id,
      ownerId: owner.id,
    },
    {
      id: ids.projects.dashboard,
      name: "Admin Dashboard",
      teamId: engineering.id,
      ownerId: admin.id,
    },
    {
      id: ids.projects.betaApp,
      name: "Beta Mobile App",
      teamId: betaDev.id,
      ownerId: owner.id,
    },
  ];

  for (const project of projectDefinitions) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        teamId: project.teamId,
        ownerId: project.ownerId,
      },
      create: project,
    });
  }

  // --------------------------------------------------
  // 10. INVITATIONS
  // --------------------------------------------------

  await prisma.invitation.upsert({
    where: { id: ids.invitations.pending },
    update: {
      status: "PENDING",
      expiresAt: inviteExpiresAt,
    },
    create: {
      id: ids.invitations.pending,
      email: "newuser@example.com",
      teamId: engineering.id,
      roleId: roles.member.id,
      invitedById: owner.id,
      tokenHash: hashToken(rawInviteToken),
      status: "PENDING",
      expiresAt: inviteExpiresAt,
    },
  });

  await prisma.invitation.upsert({
    where: { id: ids.invitations.accepted },
    update: {
      status: "ACCEPTED",
      acceptedAt: now,
    },
    create: {
      id: ids.invitations.accepted,
      email: "member@example.com",
      teamId: engineering.id,
      roleId: roles.member.id,
      invitedById: owner.id,
      tokenHash: hashToken(rawAcceptedInviteToken),
      status: "ACCEPTED",
      acceptedAt: now,
      expiresAt: inviteExpiresAt,
    },
  });

  // --------------------------------------------------
  // 11. AUDIT LOGS
  // --------------------------------------------------

  const auditDefinitions = [
    {
      id: ids.auditLogs.login,
      actorId: owner.id,
      action: "user.login",
      targetType: "User",
      targetId: owner.id,
      metadata: {
        method: "password",
        success: true,
      },
    },
    {
      id: ids.auditLogs.invite,
      actorId: owner.id,
      action: "member.invited",
      targetType: "Invitation",
      targetId: ids.invitations.pending,
      metadata: {
        email: "newuser@example.com",
        role: "member",
      },
    },
    {
      id: ids.auditLogs.role,
      actorId: owner.id,
      action: "member.role_changed",
      targetType: "Membership",
      targetId: null,
      metadata: {
        oldRole: "member",
        newRole: "admin",
        teamId: marketing.id,
      },
    },
  ];

  for (const log of auditDefinitions) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {
        actorId: log.actorId,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
      },
      create: log,
    });
  }

  console.log("Seed completed successfully!");
  console.log("Demo accounts:");
  console.log("owner@example.com / 123456");
  console.log("admin@example.com / 123456");
  console.log("member@example.com / 123456");
  console.log("viewer@example.com / 123456");
  console.log("Pending invite token:", rawInviteToken);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
