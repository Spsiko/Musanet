import React, { useEffect, useRef } from "react";

function StaffView() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // VexFlow rendering will go here later.
    // For now, empty
  }, []);

  return (
    <div className="staff-view">
      <div ref={containerRef} className="staff-view__canvas-placeholder">
        <span>Staff will render here.</span>
      </div>
    </div>
  );
}

export default StaffView;
