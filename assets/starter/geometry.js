export function projectPoint(x, y, z, {width, height, yaw, scale}) {
  const rotatedX = x * Math.cos(yaw) - z * Math.sin(yaw);
  const rotatedZ = x * Math.sin(yaw) + z * Math.cos(yaw);
  return [width * .46 + rotatedX * scale, height * .64 + rotatedZ * scale * .38 - y * scale * .62];
}
