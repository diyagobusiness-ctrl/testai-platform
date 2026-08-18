'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { api } from '@/lib/api'
import {
  Shield,
  Users,
  Settings,
  Edit,
  X,
  Check,
  Crown,
  GraduationCap,
  Plus,
} from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  user_count: number
}

interface Permission {
  id: string
  name: string
  category: string
  role_name: string
}

const roleIcons: Record<string, typeof Crown> = {
  SUPER_ADMIN: Crown,
  TENANT_ADMIN: Settings,
  STUDENT: GraduationCap,
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'text-yellow-500 bg-yellow-500/10',
  TENANT_ADMIN: 'text-purple-500 bg-purple-500/10',
  STUDENT: 'text-blue-500 bg-blue-500/10',
}

export default function AccessControlPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/super-admin/roles').catch(() => ({ data: { roles: [] } })),
      api.get('/api/super-admin/permissions').catch(() => ({ data: { permissions: [] } })),
    ]).then(([rolesRes, permsRes]) => {
      setRoles(rolesRes.data.roles || [])
      setPermissions(permsRes.data.permissions || [])
    }).finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(permissions.map((p) => p.category))]

  const getRolesWithPermission = (permName: string) => {
    return permissions
      .filter((p) => p.name === permName)
      .map((p) => p.role_name)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setShowEditModal(true)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Access Control</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage roles and permissions for your platform users.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Roles */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Roles</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {roles.map((role, index) => {
                const Icon = roleIcons[role.name] || Shield
                const colorClass = roleColors[role.name] || 'text-gray-500 bg-gray-500/10'
                return (
                  <CardHover key={role.id} intensity="medium">
                    <motion.div
                      className="rounded-xl border border-border bg-card p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn('inline-flex rounded-xl p-3', colorClass)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <motion.button
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <h3 className="mt-4 text-lg font-bold">{role.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{role.description || 'No description'}</p>
                      <div className="mt-4 flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.user_count || 0}</span>
                        <span className="text-muted-foreground">users</span>
                      </div>
                    </motion.div>
                  </CardHover>
                )
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <CardHover intensity="low">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold">Permissions Matrix</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground w-[300px]">Permission</th>
                      {roles.map((role) => (
                        <th key={role.id} className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const catPerms = permissions.filter((p) => p.category === category)
                      const uniquePerms = [...new Set(catPerms.map((p) => p.name))]
                      return (
                        <>
                          <tr key={`cat-${category}`} className="bg-muted/30">
                            <td colSpan={roles.length + 1} className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {category}
                            </td>
                          </tr>
                          {uniquePerms.map((permName, permIndex) => {
                            const rolesWithPerm = getRolesWithPermission(permName)
                            return (
                              <motion.tr
                                key={permName}
                                className="border-b border-border last:border-0 hover:bg-muted/20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: permIndex * 0.02 }}
                              >
                                <td className="px-6 py-3 text-sm">{permName}</td>
                                {roles.map((role) => (
                                  <td key={role.id} className="px-6 py-3 text-center">
                                    <span
                                      className={cn(
                                        'inline-flex h-6 w-6 items-center justify-center rounded-md',
                                        rolesWithPerm.includes(role.name)
                                          ? 'bg-green-500/20 text-green-500'
                                          : 'bg-muted text-muted-foreground'
                                      )}
                                    >
                                      {rolesWithPerm.includes(role.name) ? (
                                        <Check className="h-3.5 w-3.5" />
                                      ) : (
                                        <X className="h-3.5 w-3.5" />
                                      )}
                                    </span>
                                  </td>
                                ))}
                              </motion.tr>
                            )
                          })}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardHover>

          {/* Edit Role Modal */}
          <AnimatePresence>
            {showEditModal && editingRole && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowEditModal(false)}
                />
                <motion.div
                  className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Role: {editingRole.name}</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Role Name</label>
                      <input
                        type="text"
                        defaultValue={editingRole.name}
                        disabled
                        className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm opacity-60"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Description</label>
                      <textarea
                        defaultValue={editingRole.description || ''}
                        rows={3}
                        disabled
                        className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm opacity-60 resize-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Permissions ({permissions.filter((p) => p.role_name === editingRole.name).length} assigned)
                      </label>
                      <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border p-3 space-y-2">
                        {categories.map((category) => {
                          const catPerms = permissions.filter((p) => p.category === category)
                          const uniquePerms = [...new Set(catPerms.map((p) => p.name))]
                          return (
                            <div key={category}>
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">{category}</p>
                              {uniquePerms.map((permName) => {
                                const hasPermission = permissions.some(
                                  (p) => p.name === permName && p.role_name === editingRole.name
                                )
                                return (
                                  <label key={permName} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={hasPermission}
                                      disabled
                                      className="h-4 w-4 rounded accent-primary opacity-60"
                                    />
                                    <span>{permName}</span>
                                  </label>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <motion.button
                        className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowEditModal(false)}
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
