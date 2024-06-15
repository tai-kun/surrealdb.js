export default function escape(
  str: string,
  left: string,
  right: string,
  escaped: string,
) {
  return left + str.replaceAll(right, escaped) + right;
}
