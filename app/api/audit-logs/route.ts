import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { action, entity, entityId, metadata } = body;

    // Validate required fields
    if (!action || !entity || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields: action, entity, entityId" },
        { status: 400 }
      );
    }

    // Create the audit log entry
    const auditLog = await db.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: session.user.id,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({
      success: true,
      auditLog,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get filters from URL params
    const url = new URL(req.url);
    const entity = url.searchParams.get("entity");
    const entityId = url.searchParams.get("entityId");
    const action = url.searchParams.get("action");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;
    if (action) filter.action = action;

    // Fetch audit logs
    const auditLogs = await db.auditLog.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    });

    // Get total count for pagination
    const totalCount = await db.auditLog.count({
      where: filter,
    });

    return NextResponse.json({
      auditLogs,
      pagination: {
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
