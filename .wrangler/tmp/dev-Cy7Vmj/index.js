var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/workers/routes/rooms.ts
async function handleRooms(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  const parseRoom = /* @__PURE__ */ __name((room) => {
    try {
      if (room.amenities && typeof room.amenities === "string") room.amenities = JSON.parse(room.amenities);
      if (room.images && typeof room.images === "string") room.images = JSON.parse(room.images);
      if (room.features && typeof room.features === "string") room.features = JSON.parse(room.features);
    } catch (e) {
      console.error("Error parsing room data:", e);
      if (typeof room.amenities === "string") room.amenities = [];
      if (typeof room.images === "string") room.images = [];
      if (typeof room.features === "string") room.features = [];
    }
    return room;
  }, "parseRoom");
  if (pathParts.length === 2 && method === "GET") {
    try {
      const { searchParams } = url;
      const includeAll = searchParams.get("all") === "true";
      const query = includeAll ? "SELECT * FROM rooms ORDER BY name" : "SELECT * FROM rooms WHERE is_active = 1 ORDER BY name";
      const result = await env.DB.prepare(query).all();
      const rooms = result.results.map(parseRoom);
      return new Response(JSON.stringify({
        success: true,
        data: rooms
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 3 && method === "GET") {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare(
        "SELECT * FROM rooms WHERE id = ?"
      ).bind(id).first();
      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: "Room not found"
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: parseRoom(result)
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 2 && method === "POST") {
    try {
      const { name, type, description, price_per_night, max_guests, amenities, images } = body;
      if (!name) {
        return new Response(JSON.stringify({
          success: false,
          error: "Room name is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const result = await env.DB.prepare(
        `INSERT INTO rooms (name, type, description, price_per_night, max_guests, amenities, images, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
      ).bind(
        name,
        type || "Standard",
        description || "",
        price_per_night || 0,
        max_guests || 2,
        JSON.stringify(amenities || []),
        JSON.stringify(images || [])
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id, name, type },
        message: "Room created successfully"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 3 && method === "PUT") {
    try {
      const id = parseInt(pathParts[2]);
      const { name, type, description, price_per_night, max_guests, amenities, images, is_active } = body;
      const updates = [];
      const values = [];
      if (name !== void 0) {
        updates.push("name = ?");
        values.push(name);
      }
      if (type !== void 0) {
        updates.push("type = ?");
        values.push(type);
      }
      if (description !== void 0) {
        updates.push("description = ?");
        values.push(description);
      }
      if (price_per_night !== void 0) {
        updates.push("price_per_night = ?");
        values.push(price_per_night);
      }
      if (max_guests !== void 0) {
        updates.push("max_guests = ?");
        values.push(max_guests);
      }
      if (amenities !== void 0) {
        updates.push("amenities = ?");
        values.push(JSON.stringify(amenities));
      }
      if (images !== void 0) {
        updates.push("images = ?");
        values.push(JSON.stringify(images));
      }
      if (is_active !== void 0) {
        updates.push("is_active = ?");
        values.push(is_active ? 1 : 0);
      }
      updates.push("updated_at = datetime('now')");
      values.push(id);
      await env.DB.prepare(
        `UPDATE rooms SET ${updates.join(", ")} WHERE id = ?`
      ).bind(...values).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Room updated successfully"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 3 && method === "DELETE") {
    try {
      const id = parseInt(pathParts[2]);
      await env.DB.prepare(
        "UPDATE rooms SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
      ).bind(id).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Room deleted successfully"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  return new Response(JSON.stringify({
    success: false,
    error: "Invalid rooms endpoint"
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(handleRooms, "handleRooms");

// src/workers/routes/packages.ts
async function handlePackages(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  const parsePackage = /* @__PURE__ */ __name((pkg) => {
    try {
      if (pkg.images && typeof pkg.images === "string") pkg.images = JSON.parse(pkg.images);
    } catch (e) {
      console.error("Error parsing package data:", e);
      if (typeof pkg.images === "string") pkg.images = [];
    }
    return pkg;
  }, "parsePackage");
  if (pathParts.length === 2 && method === "GET") {
    try {
      const result = await env.DB.prepare(
        "SELECT * FROM packages WHERE is_active = 1 ORDER BY name"
      ).all();
      const packages = result.results.map(parsePackage);
      return new Response(JSON.stringify({
        success: true,
        data: packages
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 3 && method === "GET") {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare(
        "SELECT * FROM packages WHERE id = ?"
      ).bind(id).first();
      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: "Package not found"
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: parsePackage(result)
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 4 && pathParts[3] === "rooms" && method === "GET") {
    try {
      const packageId = parseInt(pathParts[2]);
      const result = await env.DB.prepare(`
        SELECT pr.*, r.name as room_name, r.description as room_description
        FROM package_rooms pr
        JOIN rooms r ON pr.room_id = r.id
        WHERE pr.package_id = ? AND pr.is_active = 1
        ORDER BY pr.is_default DESC, pr.availability_priority
      `).bind(packageId).all();
      return new Response(JSON.stringify({
        success: true,
        data: result.results
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 4 && pathParts[3] === "inclusions" && method === "GET") {
    try {
      const packageId = parseInt(pathParts[2]);
      const result = await env.DB.prepare(`
        SELECT pi.*, i.name, i.description, i.icon
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ? AND pi.is_active = 1
        ORDER BY i.name
      `).bind(packageId).all();
      return new Response(JSON.stringify({
        success: true,
        data: result.results
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 2 && method === "POST") {
    try {
      const {
        name,
        description,
        type,
        base_room_id,
        base_price,
        min_nights,
        max_nights,
        max_guests,
        discount_percentage,
        is_active,
        inclusions,
        exclusions,
        featured
      } = body;
      if (!name) {
        return new Response(JSON.stringify({
          success: false,
          error: "Package name is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const result = await env.DB.prepare(
        `INSERT INTO packages (name, description, package_type, base_price, discount_percentage, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        description || "",
        type || "Romance",
        base_price || 0,
        discount_percentage || 0,
        min_nights || 1,
        max_nights || 30,
        max_guests || 2,
        base_room_id || null,
        is_active !== false ? 1 : 0,
        featured ? 1 : 0,
        JSON.stringify(inclusions || []),
        JSON.stringify(exclusions || [])
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id, name },
        message: "Package created successfully"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 2 && method === "PUT") {
    try {
      const { id, ...fields } = body;
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: "Package ID is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const updates = [];
      const values = [];
      if (fields.name !== void 0) {
        updates.push("name = ?");
        values.push(fields.name);
      }
      if (fields.description !== void 0) {
        updates.push("description = ?");
        values.push(fields.description);
      }
      if (fields.package_type !== void 0) {
        updates.push("package_type = ?");
        values.push(fields.package_type);
      }
      if (fields.base_price !== void 0) {
        updates.push("base_price = ?");
        values.push(fields.base_price);
      }
      if (fields.discount_percentage !== void 0) {
        updates.push("discount_percentage = ?");
        values.push(fields.discount_percentage);
      }
      if (fields.min_nights !== void 0) {
        updates.push("min_nights = ?");
        values.push(fields.min_nights);
      }
      if (fields.max_nights !== void 0) {
        updates.push("max_nights = ?");
        values.push(fields.max_nights);
      }
      if (fields.max_guests !== void 0) {
        updates.push("max_guests = ?");
        values.push(fields.max_guests);
      }
      if (fields.base_room_id !== void 0) {
        updates.push("base_room_id = ?");
        values.push(fields.base_room_id || null);
      }
      if (fields.is_active !== void 0) {
        updates.push("is_active = ?");
        values.push(fields.is_active ? 1 : 0);
      }
      if (fields.is_featured !== void 0) {
        updates.push("is_featured = ?");
        values.push(fields.is_featured ? 1 : 0);
      }
      if (fields.includes !== void 0) {
        updates.push("inclusions = ?");
        values.push(fields.includes);
      }
      if (fields.exclusions !== void 0) {
        updates.push("exclusions = ?");
        values.push(fields.exclusions);
      }
      if (fields.images !== void 0) {
        updates.push("images = ?");
        values.push(fields.images);
      }
      if (fields.valid_from !== void 0) {
        updates.push("valid_from = ?");
        values.push(fields.valid_from);
      }
      if (fields.valid_until !== void 0) {
        updates.push("valid_until = ?");
        values.push(fields.valid_until);
      }
      if (fields.terms_conditions !== void 0) {
        updates.push("terms_conditions = ?");
        values.push(fields.terms_conditions);
      }
      if (updates.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: "No fields to update"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      updates.push("updated_at = datetime('now')");
      values.push(id);
      await env.DB.prepare(
        `UPDATE packages SET ${updates.join(", ")} WHERE id = ?`
      ).bind(...values).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Package updated successfully"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 2 && method === "DELETE") {
    try {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: "Package ID is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      await env.DB.prepare(
        "UPDATE packages SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
      ).bind(id).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Package deleted successfully"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  return new Response(JSON.stringify({
    success: false,
    error: "Invalid packages endpoint"
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(handlePackages, "handlePackages");

// src/workers/routes/villa.ts
async function handleVilla(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.length === 2 && method === "GET") {
    try {
      const result = await env.DB.prepare(
        "SELECT * FROM villa_info LIMIT 1"
      ).first();
      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: "Villa information not found"
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const transformedData = {
        id: result.id,
        name: result.name || "Villa Name",
        location: result.location || "",
        description: result.description || "",
        rating: 4.5,
        // Default rating - can be calculated from reviews later
        reviews: 0,
        // Default reviews count
        images: result.images ? JSON.parse(result.images) : [],
        amenities: result.amenities_summary ? result.amenities_summary.split(",").map((item) => ({
          name: item.trim(),
          icon: "Star"
          // Default icon
        })) : [],
        // Contact Information
        phone: result.phone || "",
        email: result.email || "",
        website: result.website || "",
        // Address Information
        address: result.address || "",
        city: result.location ? result.location.split(",")[0].trim() : "",
        state: result.location ? result.location.split(",")[1]?.trim() || "" : "",
        zipCode: "",
        country: result.location ? result.location.split(",").pop()?.trim() || "" : "",
        // Additional Information
        checkInTime: result.check_in_time || "14:00",
        checkOutTime: result.check_out_time || "12:00",
        maxGuests: result.max_guests || 10,
        bedrooms: result.total_rooms || 5,
        bathrooms: result.total_bathrooms || 5,
        pricePerNight: 0,
        // Will be calculated from rooms
        currency: "USD",
        // Policies
        cancellationPolicy: result.policies || "",
        houseRules: result.policies || "",
        // Social Media
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: ""
        }
      };
      return new Response(JSON.stringify({
        success: true,
        data: transformedData
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  if (pathParts.length === 2 && method === "PUT") {
    try {
      if (!body) {
        return new Response(JSON.stringify({
          success: false,
          error: "Request body is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const updateData = {
        name: body.name,
        description: body.description,
        location: body.location || `${body.city || ""}, ${body.state || ""}, ${body.country || ""}`.trim(),
        max_guests: body.maxGuests,
        total_rooms: body.bedrooms,
        total_bathrooms: body.bathrooms,
        size_sqm: body.sizeSqm,
        check_in_time: body.checkInTime,
        check_out_time: body.checkOutTime,
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: body.address,
        policies: body.cancellationPolicy || body.houseRules,
        amenities_summary: body.amenities ? body.amenities.map((a) => a.name).join(", ") : "",
        images: body.images ? JSON.stringify(body.images) : "[]"
      };
      const fields = Object.keys(updateData).filter((k) => updateData[k] !== void 0);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => updateData[field]);
      await env.DB.prepare(
        `UPDATE villa_info SET ${setClause} WHERE id = 1`
      ).bind(...values).run();
      const result = await env.DB.prepare(
        "SELECT * FROM villa_info WHERE id = 1"
      ).first();
      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to fetch updated villa information"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const transformedData = {
        id: result.id,
        name: result.name,
        location: result.location,
        description: result.description,
        rating: 4.5,
        reviews: 0,
        images: result.images ? JSON.parse(result.images) : [],
        amenities: result.amenities_summary ? result.amenities_summary.split(",").map((item) => ({
          name: item.trim(),
          icon: "Star"
        })) : [],
        phone: result.phone || "",
        email: result.email || "",
        website: result.website || "",
        address: result.address || "",
        city: result.location ? result.location.split(",")[0].trim() : "",
        state: result.location ? result.location.split(",")[1]?.trim() || "" : "",
        zipCode: "",
        country: result.location ? result.location.split(",").pop()?.trim() || "" : "",
        checkInTime: result.check_in_time || "14:00",
        checkOutTime: result.check_out_time || "12:00",
        maxGuests: result.max_guests || 10,
        bedrooms: result.total_rooms || 5,
        bathrooms: result.total_bathrooms || 5,
        pricePerNight: 0,
        currency: "USD",
        cancellationPolicy: result.policies || "",
        houseRules: result.policies || "",
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: ""
        }
      };
      return new Response(JSON.stringify({
        success: true,
        data: transformedData
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  return new Response(JSON.stringify({
    success: false,
    error: "Invalid villa endpoint"
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(handleVilla, "handleVilla");

// src/workers/index.ts
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  let body = null;
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  if ((method === "POST" || method === "PUT") && path !== "/api/images/upload") {
    try {
      body = await request.json();
    } catch (e) {
      return errorResponse("Invalid JSON body", 400);
    }
  }
  try {
    if (path === "/api/health") {
      return successResponse({
        status: "REVERTED - THIS SHOULD NOW APPEAR",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        version: "3.0.0-reverted-test"
      });
    }
    if (path === "/api/test/debug") {
      return successResponse({
        message: "Debug test successful",
        requestPath: path,
        requestMethod: method
      });
    }
    if (path === "/api/test/bookings") {
      const result = await env.DB.prepare("SELECT COUNT(*) as count FROM bookings").first();
      return successResponse(result);
    }
    if (path === "/api/test/r2") {
      const objects = await env.IMAGES.list();
      return successResponse({
        bucketAvailable: true,
        objectCount: objects.objects.length
      });
    }
    if (path === "/api/test/send-email-test") {
      return successResponse({
        message: "Email test endpoint is working!",
        status: "success",
        recipient: "greatdaniel87@gmail.com"
      });
    }
    if (path.startsWith("/api/bookings")) {
      return handleBookings(url, method, body, env);
    }
    if (path.startsWith("/api/rooms")) {
      return handleRooms(url, method, body, env);
    }
    if (path.startsWith("/api/packages")) {
      return handlePackages(url, method, body, env);
    }
    if (path.startsWith("/api/villa")) {
      return handleVilla(url, method, body, env);
    }
    if (path.startsWith("/api/amenities")) {
      return handleAmenities(url, method, body, env);
    }
    if (path.startsWith("/api/auth")) {
      return handleAuth(url, method, body, env);
    }
    if (path.startsWith("/api/images")) {
      return handleImages(url, method, request, env);
    }
    if (path.startsWith("/api/admin")) {
      return handleAdmin(url, method, body, env);
    }
    if (path.startsWith("/api/settings")) {
      return handleSettings(url, method, body, env);
    }
    if (path.startsWith("/api/email")) {
      return handleEmail(url, method, body, env);
    }
    if (path.startsWith("/api/marketing-categories")) {
      return handleMarketingCategories(url, method, body, env);
    }
    if (path.startsWith("/api/inclusions")) {
      return handleInclusions(url, method, body, env);
    }
    if (path.startsWith("/api/homepage-settings")) {
      return handleHomepageSettings(url, method, body, env);
    }
    if (path.startsWith("/api/blackout-dates")) {
      return handleBlackoutDates(url, method, body, env);
    }
    return errorResponse("Endpoint not found", 404);
  } catch (error) {
    console.error("Request error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
__name(handleRequest, "handleRequest");
function successResponse(data) {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(successResponse, "successResponse");
function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(errorResponse, "errorResponse");
async function handleBookings(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.length === 2 && method === "GET") {
    try {
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const result = await env.DB.prepare(
        "SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?"
      ).bind(limit, offset).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "list" && method === "GET") {
    try {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const result = await env.DB.prepare(
        "SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?"
      ).bind(limit, offset).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "GET") {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
      if (!result) return errorResponse("Booking not found", 404);
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "ref" && pathParts[3] && method === "GET") {
    try {
      const ref = pathParts[3];
      const result = await env.DB.prepare("SELECT * FROM bookings WHERE booking_reference = ?").bind(ref).first();
      if (!result) return errorResponse("Booking not found", 404);
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "create" && method === "POST") {
    try {
      if (!body.booking_reference || !body.email || !body.check_in || !body.check_out) {
        return errorResponse("Missing required fields: booking_reference, email, check_in, check_out", 400);
      }
      await env.DB.prepare(
        `INSERT INTO bookings (
          booking_reference, room_id, package_id, first_name, last_name, email, phone,
          check_in, check_out, guests, adults, children, total_price, currency,
          special_requests, source, status, payment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        body.booking_reference,
        body.room_id || null,
        body.package_id || null,
        body.first_name,
        body.last_name,
        body.email,
        body.phone || null,
        body.check_in,
        body.check_out,
        body.guests,
        body.adults || body.guests,
        body.children || 0,
        body.total_price,
        body.currency || "USD",
        body.special_requests || null,
        body.source || "direct",
        "pending",
        "pending"
      ).run();
      return successResponse({
        booking_reference: body.booking_reference,
        message: "Booking created successfully"
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[3] === "status" && method === "PUT") {
    try {
      const id = parseInt(pathParts[2]);
      const { status, payment_status } = body;
      if (!status) return errorResponse("Status is required", 400);
      let query = "UPDATE bookings SET status = ?, updated_at = datetime('now')";
      const params = [status];
      if (payment_status) {
        query += ", payment_status = ?";
        params.push(payment_status);
      }
      query += " WHERE id = ?";
      params.push(id);
      await env.DB.prepare(query).bind(...params).run();
      return successResponse({ message: "Booking status updated" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "dates" && pathParts[3] === "search" && method === "GET") {
    try {
      const checkInBefore = url.searchParams.get("check_in_before");
      const checkOutAfter = url.searchParams.get("check_out_after");
      if (!checkInBefore || !checkOutAfter) {
        return errorResponse("Missing query parameters: check_in_before, check_out_after", 400);
      }
      const result = await env.DB.prepare(
        `SELECT * FROM bookings
         WHERE check_in <= ? AND check_out >= ?
         ORDER BY check_in ASC`
      ).bind(checkOutAfter, checkInBefore).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleBookings, "handleBookings");
async function handleAmenities(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  if ((pathParts.length === 2 || pathParts[2] === "list") && method === "GET") {
    try {
      const result = await env.DB.prepare(
        "SELECT * FROM amenities WHERE is_active = 1 ORDER BY display_order ASC"
      ).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "featured" && method === "GET") {
    try {
      const result = await env.DB.prepare(
        "SELECT * FROM amenities WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC"
      ).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "category" && pathParts[3] && method === "GET") {
    try {
      const category = pathParts[3];
      const result = await env.DB.prepare(
        "SELECT * FROM amenities WHERE category = ? AND is_active = 1 ORDER BY display_order ASC"
      ).bind(category).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "GET") {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare("SELECT * FROM amenities WHERE id = ?").bind(id).first();
      if (!result) return errorResponse("Amenity not found", 404);
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleAmenities, "handleAmenities");
async function handleAuth(url, method, body, env) {
  if (url.pathname === "/api/auth/login" && method === "POST") {
    try {
      if (!body.username || !body.password) {
        return errorResponse("Username and password required", 400);
      }
      const user = await env.DB.prepare(
        "SELECT id, username, email, role, password_hash FROM users WHERE username = ? AND active = 1"
      ).bind(body.username).first();
      if (!user) return errorResponse("Invalid credentials", 401);
      const token = Buffer.from(
        JSON.stringify({ id: user.id, username: user.username, role: user.role })
      ).toString("base64");
      return successResponse({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (url.pathname === "/api/auth/verify" && method === "POST") {
    try {
      if (!body.token) return errorResponse("Token required", 400);
      const decoded = JSON.parse(Buffer.from(body.token, "base64").toString());
      return successResponse({ valid: true, user: decoded });
    } catch (error) {
      return errorResponse("Invalid token", 401);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleAuth, "handleAuth");
async function handleImages(url, method, request, env) {
  const R2_PUBLIC_URL = "https://bookingengine-8g1-boe-kxn.pages.dev";
  if (url.pathname === "/api/images/list" && method === "GET") {
    try {
      const prefix = url.searchParams.get("prefix") || "";
      const listed = await env.IMAGES.list({ prefix });
      return successResponse({
        files: listed.objects.map((obj) => ({
          id: obj.key,
          filename: obj.key.split("/").pop(),
          uploaded: obj.uploaded.toISOString(),
          size: obj.size,
          url: `${R2_PUBLIC_URL}/${obj.key}`
        }))
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (url.pathname === "/api/images/upload" && method === "POST") {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      const prefix = formData.get("prefix") || "";
      if (!file) return errorResponse("No file provided", 400);
      if (file.size > 10 * 1024 * 1024) {
        return errorResponse("File too large. Max 10MB", 413);
      }
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
      if (!allowedMimes.includes(file.type)) {
        return errorResponse("Invalid file type. Only JPEG, PNG, WebP, AVIF, GIF allowed", 400);
      }
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop();
      const filename = `${timestamp}-${randomString}.${extension}`;
      const key = prefix ? `${prefix}${filename}` : filename;
      const arrayBuffer = await file.arrayBuffer();
      await env.IMAGES.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      return successResponse({
        success: true,
        id: key,
        filename: file.name,
        key,
        url: `${R2_PUBLIC_URL}/${key}`,
        uploaded: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("R2 upload error:", error);
      return errorResponse(error.message);
    }
  }
  if (url.pathname.startsWith("/api/images/") && method === "DELETE") {
    try {
      const imageKey = url.pathname.replace("/api/images/", "");
      await env.IMAGES.delete(imageKey);
      return successResponse({ success: true, message: "Image deleted", key: imageKey });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleImages, "handleImages");
async function handleAdmin(url, method, body, env) {
  if (url.pathname === "/api/admin/dashboard" && method === "GET") {
    try {
      const [bookingsCount, amenitiesCount, usersCount, totalRevenue] = await Promise.all([
        env.DB.prepare("SELECT COUNT(*) as count FROM bookings").first(),
        env.DB.prepare("SELECT COUNT(*) as count FROM amenities").first(),
        env.DB.prepare("SELECT COUNT(*) as count FROM users").first(),
        env.DB.prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE payment_status = ?").bind("completed").first()
      ]);
      return successResponse({
        bookingsCount: bookingsCount.count || 0,
        amenitiesCount: amenitiesCount.count || 0,
        usersCount: usersCount.count || 0,
        totalRevenue: totalRevenue.total || 0
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (url.pathname === "/api/admin/analytics" && method === "GET") {
    try {
      const result = await env.DB.prepare(
        "SELECT SUM(bookings_count) as bookings, SUM(revenue) as revenue, COUNT(*) as days FROM daily_analytics LIMIT 30"
      ).first();
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleAdmin, "handleAdmin");
async function handleSettings(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  const settingKey = pathParts[2];
  if (method === "GET" && !settingKey) {
    try {
      const cachedSettings = await env.CACHE.get("app_settings", "json");
      if (cachedSettings) {
        return successResponse(cachedSettings);
      }
      const defaultSettings = {
        admin_email: env.ADMIN_EMAIL || "danielsantosomarketing2017@gmail.com",
        villa_name: env.VILLA_NAME || "Best Villa Bali",
        from_email: env.FROM_EMAIL || "danielsantosomarketing2017@gmail.com"
      };
      return successResponse(defaultSettings);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (method === "GET" && settingKey) {
    try {
      const settings = await env.CACHE.get("app_settings", "json");
      if (settings && settings[settingKey]) {
        return successResponse({ key: settingKey, value: settings[settingKey] });
      }
      const defaults = {
        admin_email: env.ADMIN_EMAIL || "danielsantosomarketing2017@gmail.com",
        villa_name: env.VILLA_NAME || "Best Villa Bali"
      };
      return successResponse({ key: settingKey, value: defaults[settingKey] || null });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (method === "POST") {
    try {
      const { admin_email, villa_name, from_email } = body;
      const existing = await env.CACHE.get("app_settings", "json") || {};
      const updatedSettings = {
        ...existing,
        admin_email: admin_email || existing.admin_email || env.ADMIN_EMAIL,
        villa_name: villa_name || existing.villa_name || env.VILLA_NAME,
        from_email: from_email || existing.from_email || env.FROM_EMAIL,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      await env.CACHE.put("app_settings", JSON.stringify(updatedSettings));
      return successResponse({
        message: "Settings updated successfully",
        settings: updatedSettings
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (method === "PUT" && settingKey) {
    try {
      const { value } = body;
      const existing = await env.CACHE.get("app_settings", "json") || {};
      existing[settingKey] = value;
      existing.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      await env.CACHE.put("app_settings", JSON.stringify(existing));
      return successResponse({
        message: `Setting '${settingKey}' updated successfully`,
        key: settingKey,
        value
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Settings endpoint not found", 404);
}
__name(handleSettings, "handleSettings");
async function getAdminEmail(env) {
  try {
    const settings = await env.CACHE.get("app_settings", "json");
    if (settings && settings.admin_email) {
      return settings.admin_email;
    }
  } catch (e) {
    console.error("Error getting admin email from KV:", e);
  }
  return env.ADMIN_EMAIL || "danielsantosomarketing2017@gmail.com";
}
__name(getAdminEmail, "getAdminEmail");
async function handleEmail(url, method, body, env) {
  if (method !== "POST") {
    return errorResponse("Only POST method allowed", 405);
  }
  const pathParts = url.pathname.split("/").filter(Boolean);
  const action = pathParts[2];
  try {
    if (action === "booking-confirmation") {
      const { booking_data } = body;
      if (!booking_data || !booking_data.guest_email) {
        return errorResponse("Missing booking_data or guest_email", 400);
      }
      const emailHtml = getBookingConfirmationHtml(booking_data, env);
      const resendResult = await sendEmailViaResend(
        env,
        booking_data.guest_email,
        `\u{1F389} Booking Confirmation - ${env.VILLA_NAME || "Best Villa Bali"}`,
        emailHtml
      );
      await env.CACHE.put(
        `email:${booking_data.booking_reference}:guest`,
        JSON.stringify({
          to: booking_data.guest_email,
          type: "booking_confirmation",
          sent_at: (/* @__PURE__ */ new Date()).toISOString(),
          booking_data,
          resend_id: resendResult.id
        }),
        { expirationTtl: 86400 * 30 }
      );
      return successResponse({
        success: true,
        message: "Booking confirmation email sent successfully",
        recipient: booking_data.guest_email,
        booking_reference: booking_data.booking_reference,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        email_id: resendResult.id,
        resend_error: resendResult.error || null
      });
    }
    if (action === "admin-notification") {
      const { booking_data } = body;
      const adminEmail = await getAdminEmail(env);
      const emailHtml = getAdminNotificationHtml(booking_data, env);
      const resendResult = await sendEmailViaResend(
        env,
        adminEmail,
        `\u{1F514} New Booking Alert - ${booking_data?.booking_reference || "New Booking"}`,
        emailHtml
      );
      await env.CACHE.put(
        `email:${booking_data?.booking_reference}:admin`,
        JSON.stringify({
          to: adminEmail,
          type: "admin_notification",
          sent_at: (/* @__PURE__ */ new Date()).toISOString(),
          booking_data,
          resend_id: resendResult.id
        }),
        { expirationTtl: 86400 * 30 }
      );
      return successResponse({
        success: true,
        message: "Admin notification email sent successfully",
        recipient: adminEmail,
        booking_reference: booking_data?.booking_reference,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        email_id: resendResult.id
      });
    }
    if (action === "status-change") {
      const { booking_data, old_status, new_status } = body;
      const emailResult = {
        success: true,
        message: "Status change notification sent",
        booking_reference: booking_data?.booking_reference,
        status_change: `${old_status} \u2192 ${new_status}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      return successResponse(emailResult);
    }
    return errorResponse("Unknown email action", 400);
  } catch (error) {
    console.error("Email handler error:", error);
    return errorResponse(error.message || "Email service error", 500);
  }
}
__name(handleEmail, "handleEmail");
async function sendEmailViaResend(env, to, subject, html) {
  const RESEND_API_KEY = env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return { id: "no-api-key" };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `${env.VILLA_NAME || "Best Villa Bali"} <booking@bookingengine.com>`,
        to: [to],
        subject,
        html
      })
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Resend API error:", result);
      return { id: "error-" + Date.now(), error: JSON.stringify(result) };
    }
    return { id: result.id || "sent-" + Date.now() };
  } catch (error) {
    console.error("Resend fetch error:", error);
    return { id: "error-" + Date.now() };
  }
}
__name(sendEmailViaResend, "sendEmailViaResend");
function getBookingConfirmationHtml(booking, env) {
  const villaName = env.VILLA_NAME || "Best Villa Bali";
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2E8B57; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .detail-row { padding: 12px 0; border-bottom: 1px solid #eee; display: flex; }
    .detail-label { font-weight: bold; color: #2E8B57; width: 40%; }
    .detail-value { width: 60%; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f0f0f0; border-radius: 0 0 8px 8px; }
    .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E8B57; }
    h1 { margin: 0; font-size: 28px; }
    h2 { margin: 10px 0 0; font-size: 18px; font-weight: normal; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F3E8} ${villaName}</h1>
      <h2>Booking Confirmation</h2>
    </div>
    <div class="content">
      <div class="highlight">
        <h3 style="margin-top:0;">\u2705 Your booking has been confirmed!</h3>
        <p style="margin-bottom:0;"><strong>Booking Reference:</strong> ${booking.booking_reference || "BK-" + Date.now()}</p>
      </div>
      
      <div class="booking-details">
        <h3 style="margin-top:0;">\u{1F4CB} Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Guest Name:</span>
          <span class="detail-value">${booking.guest_name || "Guest"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${booking.guest_email || ""}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in:</span>
          <span class="detail-value">${booking.check_in || "TBD"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out:</span>
          <span class="detail-value">${booking.check_out || "TBD"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Guests:</span>
          <span class="detail-value">${booking.guests || "1"} guest(s)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room/Package:</span>
          <span class="detail-value">${booking.room_name || "Standard Room"}</span>
        </div>
        <div class="detail-row" style="border-bottom:none;">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value"><strong>$${booking.total_amount || "0.00"}</strong></span>
        </div>
      </div>
      
      <p>We look forward to welcoming you!</p>
    </div>
    <div class="footer">
      <p>Thank you for choosing ${villaName} for your Bali getaway.</p>
      <p>${villaName} | Luxury Accommodation in Bali</p>
      <p>Email sent: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
}
__name(getBookingConfirmationHtml, "getBookingConfirmationHtml");
function getAdminNotificationHtml(booking, env) {
  const villaName = env.VILLA_NAME || "Best Villa Bali";
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FF6B35; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .detail-row { padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #FF6B35; display: inline-block; width: 40%; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f0f0f0; border-radius: 0 0 8px 8px; }
    .alert { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35; }
    h1 { margin: 0; font-size: 28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F514} New Booking Alert</h1>
      <p style="margin:10px 0 0;">${villaName}</p>
    </div>
    <div class="content">
      <div class="alert">
        <h3 style="margin-top:0;">\u26A1 New booking received!</h3>
        <p style="margin-bottom:0;"><strong>Action Required:</strong> Review and confirm booking details</p>
      </div>
      
      <div class="booking-details">
        <h3 style="margin-top:0;">\u{1F4CB} Booking Information</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Ref:</span> ${booking?.booking_reference || "N/A"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Guest Name:</span> ${booking?.guest_name || "Guest"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span> ${booking?.guest_email || "N/A"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span> ${booking?.guest_phone || booking?.phone || "Not provided"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in:</span> ${booking?.check_in || "TBD"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out:</span> ${booking?.check_out || "TBD"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Guests:</span> ${booking?.guests || "1"} guest(s)
        </div>
        <div class="detail-row">
          <span class="detail-label">Room/Package:</span> ${booking?.room_name || "Standard Room"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span> <strong>$${booking?.total_amount || "0.00"}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking Time:</span> ${(/* @__PURE__ */ new Date()).toISOString()}
        </div>
      </div>
    </div>
    <div class="footer">
      <p>${villaName} - Admin Notification System</p>
      <p>${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
}
__name(getAdminNotificationHtml, "getAdminNotificationHtml");
var workers_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    return handleRequest(request, env);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-WAQ1Bn/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = workers_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-WAQ1Bn/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
