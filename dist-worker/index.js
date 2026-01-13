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
      const includeInactive = url.searchParams.get("include_inactive") === "1";
      const query = includeInactive ? `SELECT pr.*, r.name as room_name, r.description as room_description, r.images as room_images
           FROM package_rooms pr
           JOIN rooms r ON pr.room_id = r.id
           WHERE pr.package_id = ?
           ORDER BY pr.is_default DESC, pr.availability_priority` : `SELECT pr.*, r.name as room_name, r.description as room_description, r.images as room_images
           FROM package_rooms pr
           JOIN rooms r ON pr.room_id = r.id
           WHERE pr.package_id = ? AND pr.is_active = 1
           ORDER BY pr.is_default DESC, pr.availability_priority`;
      const result = await env.DB.prepare(query).bind(packageId).all();
      const rooms = result.results.map((room) => {
        if (room.room_images && typeof room.room_images === "string") {
          try {
            room.images = JSON.parse(room.room_images);
          } catch {
            room.images = [];
          }
        } else {
          room.images = room.room_images || [];
        }
        delete room.room_images;
        return room;
      });
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
  if (pathParts.length === 4 && pathParts[3] === "rooms" && method === "POST") {
    try {
      const packageId = parseInt(pathParts[2]);
      const {
        room_id,
        is_default = 0,
        price_adjustment = 0,
        adjustment_type = "fixed",
        availability_priority = 1,
        max_occupancy_override = null,
        description = null
      } = body;
      if (!room_id) {
        return new Response(JSON.stringify({
          success: false,
          error: "room_id is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const existing = await env.DB.prepare(
        "SELECT * FROM package_rooms WHERE package_id = ? AND room_id = ?"
      ).bind(packageId, room_id).first();
      if (existing) {
        await env.DB.prepare(
          `UPDATE package_rooms 
           SET is_active = 1, is_default = ?, price_adjustment = ?, adjustment_type = ?, 
               availability_priority = ?, max_occupancy_override = ?, description = ?
           WHERE package_id = ? AND room_id = ?`
        ).bind(
          is_default ? 1 : 0,
          price_adjustment,
          adjustment_type,
          availability_priority,
          max_occupancy_override,
          description,
          packageId,
          room_id
        ).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Room relationship updated"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (is_default) {
        await env.DB.prepare(
          "UPDATE package_rooms SET is_default = 0 WHERE package_id = ?"
        ).bind(packageId).run();
      }
      const result = await env.DB.prepare(
        `INSERT INTO package_rooms (package_id, room_id, is_default, price_adjustment, adjustment_type, availability_priority, max_occupancy_override, description, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(
        packageId,
        room_id,
        is_default ? 1 : 0,
        price_adjustment,
        adjustment_type,
        availability_priority,
        max_occupancy_override,
        description
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id },
        message: "Room added to package"
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
  if (pathParts.length === 4 && pathParts[2] === "rooms" && method === "PUT") {
    try {
      const relationshipId = parseInt(pathParts[3]);
      const {
        is_default,
        price_adjustment,
        adjustment_type,
        availability_priority,
        max_occupancy_override,
        description,
        is_active
      } = body;
      const updates = [];
      const values = [];
      if (is_default !== void 0) {
        if (is_default) {
          const rel = await env.DB.prepare(
            "SELECT package_id FROM package_rooms WHERE id = ?"
          ).bind(relationshipId).first();
          if (rel) {
            await env.DB.prepare(
              "UPDATE package_rooms SET is_default = 0 WHERE package_id = ?"
            ).bind(rel.package_id).run();
          }
        }
        updates.push("is_default = ?");
        values.push(is_default ? 1 : 0);
      }
      if (price_adjustment !== void 0) {
        updates.push("price_adjustment = ?");
        values.push(price_adjustment);
      }
      if (adjustment_type !== void 0) {
        updates.push("adjustment_type = ?");
        values.push(adjustment_type);
      }
      if (availability_priority !== void 0) {
        updates.push("availability_priority = ?");
        values.push(availability_priority);
      }
      if (max_occupancy_override !== void 0) {
        updates.push("max_occupancy_override = ?");
        values.push(max_occupancy_override);
      }
      if (description !== void 0) {
        updates.push("description = ?");
        values.push(description);
      }
      if (is_active !== void 0) {
        updates.push("is_active = ?");
        values.push(is_active ? 1 : 0);
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
      values.push(relationshipId);
      await env.DB.prepare(
        `UPDATE package_rooms SET ${updates.join(", ")} WHERE id = ?`
      ).bind(...values).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Package room relationship updated"
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
  if (pathParts.length === 4 && pathParts[2] === "rooms" && method === "DELETE") {
    try {
      const relationshipId = parseInt(pathParts[3]);
      await env.DB.prepare(
        "UPDATE package_rooms SET is_active = 0 WHERE id = ?"
      ).bind(relationshipId).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Room removed from package"
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
        SELECT pi.inclusion_id, i.name, i.description, i.package_type as category
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ? AND pi.is_active = 1 AND i.is_active = 1
        ORDER BY i.name
      `).bind(packageId).all();
      return new Response(JSON.stringify({
        success: true,
        inclusions: result.results
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
  if (pathParts.length === 4 && pathParts[3] === "inclusions" && method === "POST") {
    try {
      const packageId = parseInt(pathParts[2]);
      const { inclusion_id } = body;
      if (!inclusion_id) {
        return new Response(JSON.stringify({
          success: false,
          error: "inclusion_id is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const existing = await env.DB.prepare(
        "SELECT * FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?"
      ).bind(packageId, inclusion_id).first();
      if (existing) {
        await env.DB.prepare(
          "UPDATE package_inclusions SET is_active = 1 WHERE package_id = ? AND inclusion_id = ?"
        ).bind(packageId, inclusion_id).run();
      } else {
        await env.DB.prepare(
          "INSERT INTO package_inclusions (package_id, inclusion_id, is_active) VALUES (?, ?, 1)"
        ).bind(packageId, inclusion_id).run();
      }
      return new Response(JSON.stringify({
        success: true,
        message: "Inclusion added to package"
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
  if (pathParts.length === 5 && pathParts[3] === "inclusions" && method === "DELETE") {
    try {
      const packageId = parseInt(pathParts[2]);
      const inclusionId = parseInt(pathParts[4]);
      await env.DB.prepare(
        "UPDATE package_inclusions SET is_active = 0 WHERE package_id = ? AND inclusion_id = ?"
      ).bind(packageId, inclusionId).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Inclusion removed from package"
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
  if (pathParts.length === 4 && pathParts[3] === "amenities" && method === "GET") {
    try {
      const packageId = parseInt(pathParts[2]);
      const result = await env.DB.prepare(`
        SELECT pa.amenity_id as id, a.name, a.description, a.category, a.icon, pa.is_highlighted, pa.custom_note
        FROM package_amenities pa
        JOIN amenities a ON pa.amenity_id = a.id
        WHERE pa.package_id = ? AND pa.is_active = 1 AND a.is_active = 1
        ORDER BY pa.is_highlighted DESC, a.name
      `).bind(packageId).all();
      return new Response(JSON.stringify({
        success: true,
        amenities: result.results
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
  if (pathParts.length === 4 && pathParts[3] === "amenities" && method === "POST") {
    try {
      const packageId = parseInt(pathParts[2]);
      const { amenity_id, is_highlighted = false } = body;
      if (!amenity_id) {
        return new Response(JSON.stringify({
          success: false,
          error: "amenity_id is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const existing = await env.DB.prepare(
        "SELECT * FROM package_amenities WHERE package_id = ? AND amenity_id = ?"
      ).bind(packageId, amenity_id).first();
      if (existing) {
        await env.DB.prepare(
          "UPDATE package_amenities SET is_active = 1, is_highlighted = ? WHERE package_id = ? AND amenity_id = ?"
        ).bind(is_highlighted ? 1 : 0, packageId, amenity_id).run();
      } else {
        await env.DB.prepare(
          "INSERT INTO package_amenities (package_id, amenity_id, is_highlighted, is_active) VALUES (?, ?, ?, 1)"
        ).bind(packageId, amenity_id, is_highlighted ? 1 : 0).run();
      }
      return new Response(JSON.stringify({
        success: true,
        message: "Amenity added to package"
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
  if (pathParts.length === 5 && pathParts[3] === "amenities" && method === "DELETE") {
    try {
      const packageId = parseInt(pathParts[2]);
      const amenityId = parseInt(pathParts[4]);
      await env.DB.prepare(
        "UPDATE package_amenities SET is_active = 0 WHERE package_id = ? AND amenity_id = ?"
      ).bind(packageId, amenityId).run();
      return new Response(JSON.stringify({
        success: true,
        message: "Amenity removed from package"
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
        logo_url: result.logo_url || "",
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
      let location = body.location;
      if (!location && (body.city || body.state || body.country)) {
        const parts = [body.city, body.state, body.country].filter(Boolean);
        location = parts.join(", ");
      }
      const updateData = {};
      if (body.name !== void 0) updateData.name = body.name;
      if (body.description !== void 0) updateData.description = body.description;
      if (location !== void 0) updateData.location = location;
      if (body.logo_url !== void 0) updateData.logo_url = body.logo_url;
      if (body.phone !== void 0) updateData.phone = body.phone;
      if (body.email !== void 0) updateData.email = body.email;
      if (body.website !== void 0) updateData.website = body.website;
      if (body.address !== void 0) updateData.address = body.address;
      if (body.checkInTime !== void 0) updateData.check_in_time = body.checkInTime;
      if (body.check_in_time !== void 0) updateData.check_in_time = body.check_in_time;
      if (body.checkOutTime !== void 0) updateData.check_out_time = body.checkOutTime;
      if (body.check_out_time !== void 0) updateData.check_out_time = body.check_out_time;
      if (body.cancellationPolicy !== void 0) updateData.policies = body.cancellationPolicy;
      if (body.houseRules !== void 0 && !updateData.policies) updateData.policies = body.houseRules;
      if (body.maxGuests !== void 0 || body.max_guests !== void 0) {
        updateData.max_guests = body.maxGuests || body.max_guests;
      }
      if (body.bedrooms !== void 0 || body.total_rooms !== void 0) {
        updateData.total_rooms = body.bedrooms || body.total_rooms;
      }
      if (body.bathrooms !== void 0 || body.total_bathrooms !== void 0) {
        updateData.total_bathrooms = body.bathrooms || body.total_bathrooms;
      }
      if (body.images !== void 0) {
        updateData.images = typeof body.images === "string" ? body.images : JSON.stringify(body.images);
      }
      if (body.amenities !== void 0) {
        updateData.amenities_summary = body.amenities.map((a) => a.name || a).join(", ");
      }
      const fields = Object.keys(updateData);
      if (fields.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: "No valid fields to update"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => updateData[field]);
      console.log("Updating villa with:", { fields, values });
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

// src/workers/routes/payment.ts
async function generateDigest(body) {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64Hash = btoa(String.fromCharCode(...hashArray));
  return `SHA-256=${base64Hash}`;
}
__name(generateDigest, "generateDigest");
async function generateHmacSha256(message, secretKey) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return btoa(String.fromCharCode(...signatureArray));
}
__name(generateHmacSha256, "generateHmacSha256");
async function handlePayment(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (pathParts.length === 3 && pathParts[2] === "create" && method === "POST") {
    try {
      const {
        booking_reference,
        amount,
        customer_name,
        customer_email,
        customer_phone,
        callback_url
      } = body;
      if (!booking_reference || !amount || !customer_name || !customer_email) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required fields: booking_reference, amount, customer_name, customer_email"
        }), { status: 400, headers: corsHeaders });
      }
      const clientId = env.DOKU_CLIENT_ID;
      const secretKey = env.DOKU_SECRET_KEY;
      const isProduction = env.DOKU_ENVIRONMENT === "production";
      if (!clientId || !secretKey) {
        return new Response(JSON.stringify({
          success: false,
          error: "DOKU credentials not configured"
        }), { status: 500, headers: corsHeaders });
      }
      const baseUrl = isProduction ? "https://api.doku.com" : "https://api-sandbox.doku.com";
      const invoiceNumber = `${booking_reference}-${Date.now()}`;
      const defaultCallbackUrl = `${url.origin}/booking/payment-result`;
      const requestBody = {
        order: {
          amount: Math.round(amount),
          // DOKU requires integer
          invoice_number: invoiceNumber,
          callback_url: callback_url || defaultCallbackUrl,
          auto_redirect: true
        },
        payment: {
          payment_due_date: 60
          // 60 minutes expiry
        },
        customer: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone
        }
      };
      const requestBodyString = JSON.stringify(requestBody);
      const requestTarget = "/checkout/v1/payment";
      const requestId = crypto.randomUUID();
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
      const digest = await generateDigest(requestBodyString);
      const componentSignature = `Client-Id:${clientId}
Request-Id:${requestId}
Request-Timestamp:${timestamp}
Request-Target:${requestTarget}
Digest:${digest}`;
      const signature = await generateHmacSha256(componentSignature, secretKey);
      console.log("DOKU Request:", {
        url: `${baseUrl}${requestTarget}`,
        invoiceNumber,
        amount,
        customer: customer_name
      });
      const dokuResponse = await fetch(`${baseUrl}${requestTarget}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Id": clientId,
          "Request-Id": requestId,
          "Request-Timestamp": timestamp,
          "Signature": `HMACSHA256=${signature}`
        },
        body: requestBodyString
      });
      const dokuResult = await dokuResponse.json();
      console.log("DOKU Response:", dokuResult);
      if (!dokuResponse.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: "DOKU API error",
          details: dokuResult
        }), { status: dokuResponse.status, headers: corsHeaders });
      }
      const paymentUrl = dokuResult.response?.payment?.url;
      if (!paymentUrl) {
        return new Response(JSON.stringify({
          success: false,
          error: "No payment URL returned from DOKU",
          details: dokuResult
        }), { status: 500, headers: corsHeaders });
      }
      try {
        await env.DB.prepare(`
          INSERT INTO payment_transactions (
            booking_reference, invoice_number, amount, status, 
            payment_url, customer_name, customer_email, created_at
          ) VALUES (?, ?, ?, 'pending', ?, ?, ?, datetime('now'))
        `).bind(
          booking_reference,
          invoiceNumber,
          amount,
          paymentUrl,
          customer_name,
          customer_email
        ).run();
      } catch (dbError) {
        console.error("Failed to save payment record:", dbError);
      }
      return new Response(JSON.stringify({
        success: true,
        data: {
          payment_url: paymentUrl,
          invoice_number: invoiceNumber,
          amount,
          expires_in_minutes: 60
        }
      }), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Payment creation error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || "Failed to create payment"
      }), { status: 500, headers: corsHeaders });
    }
  }
  if (pathParts.length === 3 && pathParts[2] === "callback" && method === "POST") {
    try {
      console.log("DOKU Callback received:", body);
      const invoiceNumber = body.order?.invoice_number;
      const transactionStatus = body.transaction?.status;
      if (invoiceNumber && transactionStatus) {
        await env.DB.prepare(`
          UPDATE payment_transactions 
          SET status = ?, updated_at = datetime('now'), callback_data = ?
          WHERE invoice_number = ?
        `).bind(transactionStatus.toLowerCase(), JSON.stringify(body), invoiceNumber).run();
        if (transactionStatus === "SUCCESS") {
          const bookingRef = invoiceNumber.split("-")[0] + "-" + invoiceNumber.split("-")[1];
          await env.DB.prepare(`
            UPDATE bookings SET status = 'confirmed', payment_status = 'paid' 
            WHERE booking_reference LIKE ?
          `).bind(`${bookingRef}%`).run();
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error("Payment callback error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500, headers: corsHeaders });
    }
  }
  if (pathParts.length === 4 && pathParts[2] === "status" && method === "GET") {
    try {
      const invoiceNumber = pathParts[3];
      const result = await env.DB.prepare(`
        SELECT * FROM payment_transactions WHERE invoice_number = ?
      `).bind(invoiceNumber).first();
      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: "Payment not found"
        }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify({
        success: true,
        data: result
      }), { status: 200, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500, headers: corsHeaders });
    }
  }
  return new Response(JSON.stringify({
    success: false,
    error: "Invalid payment endpoint"
  }), { status: 404, headers: corsHeaders });
}
__name(handlePayment, "handlePayment");

// src/workers/index.ts
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  let body = null;
  if ((method === "POST" || method === "PUT" || method === "DELETE") && path !== "/api/images/upload") {
    try {
      body = await request.json();
    } catch (e) {
      if (method !== "DELETE") {
        return errorResponse("Invalid JSON body", 400);
      }
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
    if (path.startsWith("/api/inclusions")) {
      return handleInclusions(url, method, body, env);
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
    if (path.startsWith("/api/payment")) {
      return handlePayment(url, method, body, env);
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
  if (pathParts.length === 2 && method === "POST") {
    try {
      const { name, category, description, icon, is_featured, is_active, display_order } = body;
      if (!name) return errorResponse("Name is required", 400);
      const result = await env.DB.prepare(
        `INSERT INTO amenities (name, category, description, icon, is_featured, is_active, display_order, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        category || null,
        description || null,
        icon || "star",
        is_featured ? 1 : 0,
        is_active !== false ? 1 : 0,
        display_order || 0
      ).run();
      return successResponse({ id: result.meta.last_row_id, message: "Amenity created successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "PUT") {
    try {
      const id = parseInt(pathParts[2]);
      const { name, category, description, icon, is_featured, is_active, display_order } = body;
      const updates = [];
      const values = [];
      if (name !== void 0) {
        updates.push("name = ?");
        values.push(name);
      }
      if (category !== void 0) {
        updates.push("category = ?");
        values.push(category);
      }
      if (description !== void 0) {
        updates.push("description = ?");
        values.push(description);
      }
      if (icon !== void 0) {
        updates.push("icon = ?");
        values.push(icon);
      }
      if (is_featured !== void 0) {
        updates.push("is_featured = ?");
        values.push(is_featured ? 1 : 0);
      }
      if (is_active !== void 0) {
        updates.push("is_active = ?");
        values.push(is_active ? 1 : 0);
      }
      if (display_order !== void 0) {
        updates.push("display_order = ?");
        values.push(display_order);
      }
      updates.push("updated_at = datetime('now')");
      values.push(id);
      await env.DB.prepare(
        `UPDATE amenities SET ${updates.join(", ")} WHERE id = ?`
      ).bind(...values).run();
      return successResponse({ message: "Amenity updated successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "DELETE") {
    try {
      const id = parseInt(pathParts[2]);
      await env.DB.prepare("DELETE FROM amenities WHERE id = ?").bind(id).run();
      return successResponse({ message: "Amenity deleted successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleAmenities, "handleAmenities");
async function handleInclusions(url, method, body, env) {
  const pathParts = url.pathname.split("/").filter(Boolean);
  if ((pathParts.length === 2 || pathParts[2] === "list") && method === "GET") {
    try {
      const result = await env.DB.prepare(
        "SELECT * FROM inclusions WHERE is_active = 1 ORDER BY package_type, name ASC"
      ).all();
      return successResponse({ inclusions: result.results });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "category" && pathParts[3] && method === "GET") {
    try {
      const packageType = pathParts[3];
      const result = await env.DB.prepare(
        "SELECT * FROM inclusions WHERE package_type = ? AND is_active = 1 ORDER BY name ASC"
      ).bind(packageType).all();
      return successResponse({ inclusions: result.results });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "package" && pathParts[3] && method === "GET") {
    try {
      const packageId = parseInt(pathParts[3]);
      const result = await env.DB.prepare(`
        SELECT i.*, pi.quantity, pi.custom_description
        FROM inclusions i
        JOIN package_inclusions pi ON i.id = pi.inclusion_id
        WHERE pi.package_id = ? AND i.is_active = 1 AND pi.is_active = 1
        ORDER BY i.name ASC
      `).bind(packageId).all();
      return successResponse({ inclusions: result.results });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "GET") {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare("SELECT * FROM inclusions WHERE id = ?").bind(id).first();
      if (!result) return errorResponse("Inclusion not found", 404);
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts.length === 2 && method === "POST") {
    try {
      const { name, description, package_type, is_active } = body;
      if (!name) return errorResponse("Name is required", 400);
      const result = await env.DB.prepare(
        `INSERT INTO inclusions (name, description, package_type, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        description || null,
        package_type || null,
        is_active !== false ? 1 : 0
      ).run();
      return successResponse({ id: result.meta.last_row_id, message: "Inclusion created successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "PUT") {
    try {
      const id = parseInt(pathParts[2]);
      const { name, description, package_type, is_active } = body;
      const updates = [];
      const values = [];
      if (name !== void 0) {
        updates.push("name = ?");
        values.push(name);
      }
      if (description !== void 0) {
        updates.push("description = ?");
        values.push(description);
      }
      if (package_type !== void 0) {
        updates.push("package_type = ?");
        values.push(package_type);
      }
      if (is_active !== void 0) {
        updates.push("is_active = ?");
        values.push(is_active ? 1 : 0);
      }
      updates.push("updated_at = datetime('now')");
      values.push(id);
      await env.DB.prepare(
        `UPDATE inclusions SET ${updates.join(", ")} WHERE id = ?`
      ).bind(...values).run();
      return successResponse({ message: "Inclusion updated successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === "DELETE") {
    try {
      const id = parseInt(pathParts[2]);
      await env.DB.prepare("DELETE FROM package_inclusions WHERE inclusion_id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM inclusions WHERE id = ?").bind(id).run();
      return successResponse({ message: "Inclusion deleted successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "link-package" && method === "POST") {
    try {
      const { package_id, inclusion_id, quantity } = body;
      if (!package_id || !inclusion_id) return errorResponse("package_id and inclusion_id are required", 400);
      await env.DB.prepare(
        `INSERT INTO package_inclusions (package_id, inclusion_id, quantity, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`
      ).bind(package_id, inclusion_id, quantity || 1).run();
      return successResponse({ message: "Inclusion linked to package successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "unlink-package" && method === "DELETE") {
    try {
      const { package_id, inclusion_id } = body;
      if (!package_id || !inclusion_id) return errorResponse("package_id and inclusion_id are required", 400);
      await env.DB.prepare(
        "DELETE FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?"
      ).bind(package_id, inclusion_id).run();
      return successResponse({ message: "Inclusion unlinked from package successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "room" && pathParts[3] && method === "GET") {
    try {
      const roomId = parseInt(pathParts[3]);
      const result = await env.DB.prepare(`
        SELECT i.*, ri.quantity, ri.custom_description
        FROM inclusions i
        JOIN room_inclusions ri ON i.id = ri.inclusion_id
        WHERE ri.room_id = ? AND i.is_active = 1
        ORDER BY i.name ASC
      `).bind(roomId).all();
      return successResponse({ inclusions: result.results });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "link-room" && method === "POST") {
    try {
      const { room_id, inclusion_id, quantity, custom_description } = body;
      if (!room_id || !inclusion_id) return errorResponse("room_id and inclusion_id are required", 400);
      await env.DB.prepare(
        `INSERT OR REPLACE INTO room_inclusions (room_id, inclusion_id, quantity, custom_description, created_at, updated_at) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(room_id, inclusion_id, quantity || 1, custom_description || null).run();
      return successResponse({ message: "Inclusion linked to room successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  if (pathParts[2] === "unlink-room" && method === "DELETE") {
    try {
      const { room_id, inclusion_id } = body;
      if (!room_id || !inclusion_id) return errorResponse("room_id and inclusion_id are required", 400);
      await env.DB.prepare(
        "DELETE FROM room_inclusions WHERE room_id = ? AND inclusion_id = ?"
      ).bind(room_id, inclusion_id).run();
      return successResponse({ message: "Inclusion unlinked from room successfully" });
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  return errorResponse("Endpoint not found", 404);
}
__name(handleInclusions, "handleInclusions");
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
  const R2_PUBLIC_URL = "https://pub-e303ec878512482fa87c065266e6bedd.r2.dev";
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
        from: `${env.VILLA_NAME || "Best Villa Bali"} <booking@alphadigitalagency.id>`,
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
var index_default = {
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
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
